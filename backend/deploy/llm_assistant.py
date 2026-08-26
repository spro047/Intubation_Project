import logging
import time
from typing import Dict, Optional, Tuple

from openai import OpenAI

from .config import settings

logger = logging.getLogger("airway.llm")

_client: Optional[OpenAI] = None

SYSTEM_PROMPT = (
    "You are a clinical decision support assistant for anesthesiologists. "
    "Answer only in short bullet points."
)


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.llm_api_key or "no-key",
            base_url=settings.llm_api_url,
            timeout=settings.llm_timeout,
        )
    return _client


def _is_feasible(text: str) -> bool:
    stripped = text.strip()
    return len(stripped) >= 15


def _call_llm(prompt: str, system: str = "") -> Optional[str]:
    client = _get_client()
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    last_err: Optional[Exception] = None
    for attempt in range(settings.llm_retries + 1):
        start = time.time()
        try:
            resp = client.chat.completions.create(
                model=settings.llm_model,
                messages=messages,
                temperature=settings.llm_temperature,
                max_tokens=settings.llm_max_tokens,
                timeout=settings.llm_timeout,
            )
            text = resp.choices[0].message.content
            if text and _is_feasible(text):
                logger.info(
                    "LLM ok in %.2fs (attempt %d/%d)",
                    time.time() - start,
                    attempt + 1,
                    settings.llm_retries + 1,
                )
                return text.strip()
            last_err = RuntimeError("empty or non-feasible LLM response")
            logger.warning("LLM attempt %d: %s", attempt + 1, last_err)
        except Exception as e:
            last_err = e
            logger.warning(
                "LLM attempt %d/%d failed after %.1fs: %s",
                attempt + 1,
                settings.llm_retries + 1,
                time.time() - start,
                e,
            )
        if attempt < settings.llm_retries:
            time.sleep(1.0 * (attempt + 1))

    logger.error("LLM failed after %d attempts: %s", settings.llm_retries + 1, last_err)
    return None


def check_llm_connection() -> Tuple[bool, Optional[float]]:
    try:
        client = _get_client()
        start = time.time()
        client.models.list()
        latency_ms = round((time.time() - start) * 1000, 1)
        logger.info("LLM connection check OK (%.1f ms)", latency_ms)
        return True, latency_ms
    except Exception as e:
        logger.warning("LLM connection check failed: %s", e)
        return False, None


PATIENT_PROFILE_LABELS = {
    "age": "Age",
    "gender": "Gender",
    "bmi": "BMI",
    "bmi_category": "BMI Category",
    "mallampati_score": "Mallampati Score",
    "mallampati": "Mallampati Score",
    "tmd": "Thyromental Distance (cm)",
    "tmd_category": "TMD Category",
    "neck_circumference": "Neck Circumference (cm)",
    "neck_circ": "Neck Circumference (cm)",
    "mouth_opening": "Mouth Opening (mm)",
    "smd": "Sternomental Distance (cm)",
    "neck_movement": "Neck Movement (degrees)",
    "neck_movement_category": "Neck Movement Category",
    "beard": "Beard",
    "chest_size": "Chest Size",
    "neck_structure": "Neck Structure",
    "jaw_movement": "Jaw Movement",
    "tissue_flexibility": "Tissue Flexibility",
    "previous_airway_records": "Previous Airway Records",
    "disease_arthritis": "Disease: Arthritis",
    "disease_diabetes": "Disease: Diabetes",
    "disease_down_syndrome": "Disease: Down Syndrome",
    "breathing_snoring": "Snoring",
    "breathing_sleep_apnea": "Sleep Apnea",
    "symptom_voice_changes": "Symptom: Voice Changes",
    "symptom_difficulty_swallowing": "Symptom: Difficulty Swallowing",
    "symptom_cant_lie_flat": "Symptom: Can't Lie Flat",
    "injury_swelling": "Injury: Swelling",
    "injury_previous_neck_fracture": "Injury: Previous Neck Fracture",
    "previous_emergencies_icu": "Previous Emergencies/ICU",
}

YES_NO_FIELDS = {
    "beard", "previous_airway_records", "disease_arthritis", "disease_diabetes",
    "disease_down_syndrome", "breathing_snoring", "breathing_sleep_apnea",
    "symptom_voice_changes", "symptom_difficulty_swallowing", "symptom_cant_lie_flat",
    "injury_swelling", "injury_previous_neck_fracture", "previous_emergencies_icu",
}


def build_patient_profile(data: dict) -> str:
    parts = []
    for key, label in PATIENT_PROFILE_LABELS.items():
        val = data.get(key)
        if val is None or str(val).strip() == "":
            continue
        if key in YES_NO_FIELDS:
            is_yes = str(val).lower() in ("1", "yes", "y", "true")
            parts.append(f"{label}: {'Yes' if is_yes else 'No'}")
        else:
            parts.append(f"{label}: {val}")
    return "\n".join(parts) or "No additional patient data provided."


def _build_report_prompt(
    kind: str,
    prediction: str,
    confidence: float,
    probabilities: Dict[str, float],
    profile: str,
) -> str:
    probs_str = ", ".join(f"{k}: {v:.1%}" for k, v in probabilities.items())
    if kind == "summary":
        content_rule = (
            "Mention the predicted class, confidence, key risk factors, "
            "and airway implication."
        )
    else:
        content_rule = (
            "Include airway plan, backup equipment, staffing, monitoring, and "
            f"documentation. Tailor every bullet to the {prediction} category."
        )
    return f"""Prediction: {prediction}
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
- {content_rule}"""


FALLBACK_SUMMARY = (
    "- Prediction: {prediction} ({confidence:.1%} confidence).\n"
    "- Key risk factors: Mallampati {mallampati}, TMD {tmd} cm, BMI {bmi}.\n"
    "- Clinical correlation recommended to confirm findings.\n"
    "- Consider patient history and additional imaging if available.\n"
    "- Document airway assessment findings in patient record."
)

FALLBACK_RECOMMENDATIONS = (
    "- Prepare appropriate airway equipment based on risk category.\n"
    "- {difficult_line}\n"
    "- Monitor patient closely during induction of anesthesia.\n"
    "- Ensure emergency airway equipment is readily available.\n"
    "- Document airway management plan in patient record.\n"
    "- Consider early involvement of senior anesthesiologist if concerns persist."
)


def _fallback_summary(prediction: str, confidence: float, patient_data: dict) -> str:
    return FALLBACK_SUMMARY.format(
        prediction=prediction,
        confidence=confidence,
        mallampati=patient_data.get("mallampati_score", patient_data.get("mallampati", "N/A")),
        tmd=patient_data.get("tmd", "N/A"),
        bmi=patient_data.get("bmi", "N/A"),
    )


def _fallback_recommendations(prediction: str) -> str:
    difficult_line = (
        "Consider video laryngoscope or awake fiberoptic intubation."
        if prediction == "Difficult"
        else "Standard intubation protocol is likely sufficient."
    )
    return FALLBACK_RECOMMENDATIONS.format(difficult_line=difficult_line)


def generate_clinical_summary(
    prediction: str,
    confidence: float,
    probabilities: Dict[str, float],
    patient_data: dict,
) -> Tuple[str, str]:
    profile = build_patient_profile(patient_data)
    prompt = _build_report_prompt(
        "summary", prediction, confidence, probabilities, profile
    )
    text = _call_llm(prompt, SYSTEM_PROMPT)
    if text is None:
        logger.warning("Summary generation failed -> using fallback")
        return _fallback_summary(prediction, confidence, patient_data), "fallback"
    return text, "llm"


def generate_recommendations(
    prediction: str,
    confidence: float,
    probabilities: Dict[str, float],
    patient_data: dict,
) -> Tuple[str, str]:
    profile = build_patient_profile(patient_data)
    prompt = _build_report_prompt(
        "recommendations", prediction, confidence, probabilities, profile
    )
    text = _call_llm(prompt, SYSTEM_PROMPT)
    if text is None:
        logger.warning("Recommendations generation failed -> using fallback")
        return _fallback_recommendations(prediction), "fallback"
    return text, "llm"