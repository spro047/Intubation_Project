import requests
import json
from typing import Dict, Optional, List
from .config import settings


def _call_ollama(prompt: str, system: str = "") -> Optional[str]:
    full_prompt = f"SYSTEM: {system}\n\nUSER: {prompt}" if system else prompt
    payload = {
        "model": settings.llm_model,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": settings.llm_temperature,
            "num_predict": settings.llm_max_tokens,
        },
    }
    try:
        resp = requests.post(settings.ollama_url, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json().get("response", "")
    except requests.RequestException as e:
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
    return _call_ollama(prompt, system) or (
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
    return _call_ollama(prompt, system) or (
        "- Prepare appropriate airway equipment based on risk category.\n"
        f"- {'Consider video laryngoscope or awake fiberoptic intubation.' if prediction == 'Difficult' else 'Standard intubation protocol is likely sufficient.'}\n"
        "- Monitor patient closely during induction of anesthesia.\n"
        "- Ensure emergency airway equipment is readily available.\n"
        "- Document airway management plan in patient record.\n"
        "- Consider early involvement of senior anesthesiologist if concerns persist."
    )
