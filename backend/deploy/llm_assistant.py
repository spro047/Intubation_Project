from openai import OpenAI
from typing import Dict, Optional
from .config import settings

_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.llm_api_key or "no-key",
            base_url=settings.llm_api_url,
        )
    return _client


def _call_llm(prompt: str, system: str = "") -> Optional[str]:
    try:
        client = _get_client()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        resp = client.chat.completions.create(
            model=settings.llm_model,
            messages=messages,
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return None


def build_patient_profile(data: dict) -> str:
    parts = [
        f"Age: {data.get('age', 'N/A')}",
        f"Gender: {data.get('gender', 'N/A')}",
        f"BMI: {data.get('bmi', 'N/A')}",
        f"Mallampati Score: {data.get('mallampati_score', data.get('mallampati', 'N/A'))}",
        f"Thyromental Distance: {data.get('tmd', 'N/A')} cm",
        f"Neck Circumference: {data.get('neck_circumference', data.get('neck_circ', 'N/A'))} cm",
    ]
    comorbidities = data.get("comorbidities", {})
    if comorbidities:
        present = [f"{k}: {v}" for k, v in comorbidities.items() if v and str(v) not in ("No", "no", "0", "")]
        if present:
            parts.append(f"Comorbidities: {', '.join(present)}")
    return "\n".join(parts)


def generate_clinical_summary(
    prediction: str,
    confidence: float,
    probabilities: Dict[str, float],
    patient_data: dict,
) -> str:
    profile = build_patient_profile(patient_data)
    probs_str = ", ".join(f"{k}: {v:.1%}" for k, v in probabilities.items())
    prompt = f"""Prediction: {prediction}
Confidence: {confidence:.1%}
Probabilities: {probs_str}

Patient Profile:
{profile}

Return ONLY 5 concise bullet points.
Rules:
- Each line must start with "- ".
- No introduction, no headings, no paragraph.
- Keep every bullet under 18 words.
- Be direct, clinical, and actionable.
- Mention the predicted class, confidence, key risk factors, and airway implication."""
    system = "You are a clinical decision support assistant for anesthesiologists. Answer only in short bullet points."
    return _call_llm(prompt, system) or (
        f"- Prediction: {prediction} ({confidence:.1%} confidence).\n"
        f"- Key risk factors: Mallampati {patient_data.get('mallampati_score', 'N/A')}, "
        f"TMD {patient_data.get('tmd', 'N/A')} cm, "
        f"BMI {patient_data.get('bmi', 'N/A')}.\n"
        "- Clinical correlation recommended to confirm findings.\n"
        "- Consider patient history and additional imaging if available.\n"
        "- Document airway assessment findings in patient record."
    )


def generate_recommendations(
    prediction: str,
    confidence: float,
    probabilities: Dict[str, float],
    patient_data: dict,
) -> str:
    profile = build_patient_profile(patient_data)
    probs_str = ", ".join(f"{k}: {v:.1%}" for k, v in probabilities.items())
    prompt = f"""Prediction: {prediction}
Confidence: {confidence:.1%}
Probabilities: {probs_str}

Patient Profile:
{profile}

Return ONLY 5 action bullets for an anesthesiologist.
Rules:
- Each line must start with "- ".
- No introduction, no headings, no paragraph.
- Keep every bullet under 18 words.
- Include airway plan, backup equipment, staffing, monitoring, and documentation.
- Tailor every bullet to the {prediction} category."""
    system = "You are a clinical decision support assistant for anesthesiologists. Answer only in short bullet points."
    return _call_llm(prompt, system) or (
        "- Prepare appropriate airway equipment based on risk category.\n"
        f"- {'Consider video laryngoscope or awake fiberoptic intubation.' if prediction == 'Difficult' else 'Standard intubation protocol is likely sufficient.'}\n"
        "- Monitor patient closely during induction of anesthesia.\n"
        "- Ensure emergency airway equipment is readily available.\n"
        "- Document airway management plan in patient record.\n"
        "- Consider early involvement of senior anesthesiologist if concerns persist."
    )
