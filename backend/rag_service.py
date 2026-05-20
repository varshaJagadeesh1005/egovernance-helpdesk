import json
import os
import re
from typing import Dict, Any, List

from utils.translator import translate_text

# Load schemes from the local file
SCHEMES_FILE = os.path.join(os.path.dirname(__file__), "data", "schemes.json")

LANGUAGE_NAME_TO_CODE = {
    'english': 'en-IN',
    'hindi': 'hi-IN',
    'kannada': 'kn-IN',
    'tamil': 'ta-IN',
    'telugu': 'te-IN',
    'marathi': 'mr-IN',
    'en': 'en-IN',
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'en-in': 'en-IN',
    'hi-in': 'hi-IN',
    'kn-in': 'kn-IN',
    'ta-in': 'ta-IN',
    'te-in': 'te-IN',
    'mr-in': 'mr-IN'
}

LANGUAGE_CODE_TO_NAME = {v: k for k, v in LANGUAGE_NAME_TO_CODE.items() if '-' in v}

def normalize_language(lang: str) -> str:
    if not lang:
        return 'english'
    canonical = str(lang).strip().lower()
    canonical = canonical.replace('_', '-')
    if canonical in LANGUAGE_NAME_TO_CODE:
        code = LANGUAGE_NAME_TO_CODE[canonical]
        return {
            'en-IN': 'english',
            'hi-IN': 'hindi',
            'kn-IN': 'kannada',
            'ta-IN': 'tamil',
            'te-IN': 'telugu',
            'mr-IN': 'marathi'
        }.get(code, 'english')
    return 'english'


def load_schemes() -> List[Dict[str, Any]]:
    try:
        with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading schemes database: {e}")
        return []

def detect_language(query: str) -> str:
    """
    Detects language based on query keywords. Supports basic Indian code-mixed languages.
    """
    query_lower = query.lower()
    
    # Simple keyword-based language/code-mixed detection
    hindi_keywords = ["pension chahiye", "batao", "kaise", "ghar", "paise", "naam", "namaste", "mujhe", "karna hai", "chahiye"]
    tamil_keywords = ["vanakkam", "en kudam", "irukka", "eppadi", "uthavi", "vendum", "kidaikkum", "pension apply panni", "pension vendum"]
    telugu_keywords = ["namaskaram", "ela", "kavali", "sahayam", "yela", "pension kavali"]
    kannada_keywords = ["namaskara", "hege", "beku", "sahaya", "pension beku"]
    marathi_keywords = ["namaskar", "kasa", "havay", "mahit", "prajna", "madat", "pension havay"]
    
    if any(kw in query_lower for kw in tamil_keywords):
        return "tamil"
    if any(kw in query_lower for kw in telugu_keywords):
        return "telugu"
    if any(kw in query_lower for kw in kannada_keywords):
        return "kannada"
    if any(kw in query_lower for kw in marathi_keywords):
        return "marathi"
    if any(kw in query_lower for kw in hindi_keywords):
        return "hindi"
        
    return "english"

def parse_intent(query: str, detected_lang: str) -> Dict[str, Any]:
    """
    Parses casual elderly speech into structured intents.
    """
    query_lower = query.lower()
    
    # Intent category defaults
    intent = "OTHER"
    service_name = "General Helpdesk"
    user_action = "UNDERSTAND"
    confidence = 0.70
    requires_clarification = "NO"
    clarification_question = ""
    
    # Match scheme keywords
    schemes = load_schemes()
    matched_scheme = None
    
    pension_words = ["pension", "pensen", "pesan", "retirement", "monthly money", "paise", "vaya vandana", "old age"]
    health_words = ["health", "hospital", "illness", "treatment", "doctor", "ayushman", "pmjay", "pm-jay", "golden card", "card"]
    savings_words = ["save", "investment", "saving", "lic", "post office", "vaya vandana", "pmvvy"]
    
    # Determine Scheme
    if any(w in query_lower for w in pension_words):
        if "vaya" in query_lower or "pmvvy" in query_lower or "savings" in query_lower:
            matched_scheme = next((s for s in schemes if s["id"] == "pmvvy"), None)
        else:
            matched_scheme = next((s for s in schemes if s["id"] == "ignoaps"), None)
    elif any(w in query_lower for w in health_words):
        matched_scheme = next((s for s in schemes if s["id"] == "pmjay"), None)
        
    # Determine Intent
    if matched_scheme:
        service_name = matched_scheme["name"]
        confidence = 0.92
        
        # Check action
        if any(w in query_lower for w in ["apply", "get", "start", "form", "karna hai", "apply panni", "kavali"]):
            user_action = "APPLY"
            intent = "PENSION" if matched_scheme["id"] in ["ignoaps", "pmvvy"] else "HEALTHCARE"
        elif any(w in query_lower for w in ["status", "check", "track", "kahaan", "ekada", "engu"]):
            user_action = "CHECK_STATUS"
            intent = "PENSION" if matched_scheme["id"] in ["ignoaps", "pmvvy"] else "HEALTHCARE"
        elif any(w in query_lower for w in ["update", "change", "fix", "correct"]):
            user_action = "UPDATE"
            intent = "DOCUMENT"
        else:
            user_action = "UNDERSTAND"
            intent = "PENSION" if matched_scheme["id"] in ["ignoaps", "pmvvy"] else "HEALTHCARE"
    else:
        # Document updates fallback
        if any(w in query_lower for w in ["aadhar", "adhar", "lost", "update", "card"]):
            intent = "DOCUMENT"
            service_name = "Aadhar Card"
            user_action = "UPDATE"
            confidence = 0.85
            if "lost" in query_lower:
                user_action = "APPLY"
            else:
                requires_clarification = "YES"
                clarification_question = "What needs to be updated? Your home address, your phone number, or your name?"

    return {
        "intent": intent,
        "service_name": service_name,
        "user_action": user_action,
        "language": detected_lang.upper(),
        "confidence": confidence,
        "requires_clarification": requires_clarification,
        "clarification_question": clarification_question
    }

def format_elderly_response(scheme: Dict[str, Any], intent_data: Dict[str, Any]) -> str:
    """
    Generates a highly structured, patient, clear, and jargon-free step-by-step guide matching Section 1B.
    """
    name = scheme["simplified_name"]
    greeting = "Hello! I am so happy to help you find information about the government's schemes today."
    what_i_help = f"I will show you simple, easy steps to understand and apply for the {name}."
    
    # Construct steps
    step_texts = []
    for step in scheme["steps"]:
        num = step["step_number"]
        act = step["action"]
        exp = step["explanation"]
        voice = step["voice_command"]
        
        # Max sentence constraint & simple terms substitution
        sentences = [s.strip() for s in re.split(r'[.!?]', exp) if s.strip()]
        simple_sentences = []
        for s in sentences:
            # simple replacement
            s = s.replace("biometrics", "finger print")
            s = s.replace("biometric", "finger print")
            s = s.replace("invest", "save")
            s = s.replace("download", "get")
            s = s.replace("browser", "internet window")
            simple_sentences.append(s)
            
        exp_joined = ". ".join(simple_sentences) + "."
        
        step_text = (
            f"STEP {num}: {act}\n"
            f"        - {exp_joined}\n"
            f"        - {voice}"
        )
        step_texts.append(step_text)
        
    steps_joined = "\n\n".join(step_texts)
    
    summary = f"Once you complete these simple steps, you will get your {name} set up safely!"
    next_step = "Would you like to speak with a helpful member of our team? Or should I explain the documents you need?"
    
    response = (
        f"GREETING: \"{greeting}\"\n\n"
        f"WHAT I'LL HELP: \"{what_i_help}\"\n\n"
        f"{steps_joined}\n\n"
        f"SUMMARY: \"{summary}\"\n\n"
        f"NEXT STEP: \"{next_step}\""
    )
    return response

# Translations dictionary for demonstrating multi-language response handling
TRANSLATIONS = {
    "hindi": {
        "greeting": "नमस्ते! मुझे आपकी मदद करने में बहुत खुशी हो रही है।",
        "what_i_help": "मैं आपको इस योजना के बारे में बहुत आसान तरीके से समझाऊंगा।",
        "next_step": "क्या आप हमारे किसी मददगार साथी से सीधे बात करना चाहेंगे?"
    },
    "tamil": {
        "greeting": "வணக்கம்! உங்களுக்கு உதவுவதில் நான் மிகவும் மகிழ்ச்சியடைகிறேன்.",
        "what_i_help": "இந்த திட்டத்தைப் பற்றி உங்களுக்கு எளிய முறையில் விளக்குகிறேன்.",
        "next_step": "எங்கள் குழு உறுப்பினருடன் பேச விரும்புகிறீர்களா?"
    },
    "telugu": {
        "greeting": "నమస్కారం! మీకు సహాయం చేయడం నాకు చాలా సంతోషంగా ఉంది.",
        "what_i_help": "ఈ పథకం గురించి మీకు చాలా సులభంగా వివరిస్తాను.",
        "next_step": "మా బృంద సభ్యులతో మాట్లాడాలనుకుంటున్నారా?"
    },
    "kannada": {
        "greeting": "ನಮಸ್ಕಾರ! ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನನಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.",
        "what_i_help": "ಈ ಯೋಜನೆಯ ಬಗ್ಗೆ ನಿಮಗೆ ಸುಲಭವಾಗಿ ತಿಳಿಸಿಕೊಡುತ್ತೇನೆ.",
        "next_step": "ನಮ್ಮ ತಂಡದ ಸಿಬ್ಬಂದಿಯೊಂದಿಗೆ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?"
    },
    "marathi": {
        "greeting": "नमस्कार! मला तुमची मदत करायला खूप आनंद होत आहे.",
        "what_i_help": "मी तुम्हाला या योजनेबद्दल अत्यंत सोप्या भाषेत माहिती देतो.",
        "next_step": "तुम्हाला आमच्या टीममधील सहकाऱ्याशी बोलायला आवडेल का?"
    }
}

def translate_response(english_response: str, lang: str, scheme: Dict[str, Any]) -> str:
    """
    Fully translate the English response into the requested target language.
    """
    normalized_lang = normalize_language(lang)
    target_code = LANGUAGE_NAME_TO_CODE.get(normalized_lang, 'en-IN')
    if target_code == 'en-IN':
        return english_response
    return translate_text(english_response, target_code)

def query_helpdesk(query: str, preferred_lang: str = None) -> Dict[str, Any]:
    schemes = load_schemes()
    
    # Determine target conversation language
    lang = normalize_language(preferred_lang if preferred_lang else detect_language(query))
    
    # Parse intent
    intent_data = parse_intent(query, lang)
    
    # Locate scheme
    scheme = None
    if intent_data["service_name"] != "General Helpdesk":
        scheme = next((s for s in schemes if s["name"] == intent_data["service_name"]), None)
        
    if not scheme:
        # Fallback response for un-recognized or general questions
        response = (
            "GREETING: \"Hello! I'm here to help you.\"\n\n"
            "WHAT I'LL HELP: \"I can help you find pension schemes, health card schemes, and savings schemes.\"\n\n"
            "STEP 1: Tell me what you need help with\n"
            "        - You can ask about Pension, Health Card, or Savings.\n"
            "        - Or say: 'Tell me about pensions'\n\n"
            "SUMMARY: \"I've shown you general help options.\"\n\n"
            "NEXT STEP: \"Would you like me to connect you with our helpdesk caller? Or would you like to ask something else?\""
        )
        if intent_data["requires_clarification"] == "YES":
            response = (
                f"GREETING: \"No problem! I can help you with your {intent_data['service_name']}.\"\n\n"
                f"WHAT I'LL HELP: \"Let's resolve: {intent_data['clarification_question']}\"\n\n"
                f"STEP 1: Tell us what you want to fix\n"
                f"        - Say or type your address, phone, or name update.\n"
                f"        - Or say: 'Update phone number'\n\n"
                f"SUMMARY: \"Awaiting your specific update details.\"\n\n"
                f"NEXT STEP: \"Or say: 'Call human' to speak to our friendly support team directly.\""
            )
        final_response = response
        if lang != 'english':
            final_response = translate_response(response, lang, scheme)
        return {
            "response": final_response,
            "intent": intent_data["intent"],
            "confidence": intent_data["confidence"],
            "language": lang.upper(),
            "requires_clarification": intent_data["requires_clarification"],
            "clarification_question": intent_data["clarification_question"],
            "scheme_id": None
        }
        
    # Generate response
    english_resp = format_elderly_response(scheme, intent_data)
    
    # Translate if non-english
    final_resp = english_resp
    if lang != "english":
        final_resp = translate_response(english_resp, lang, scheme)
        
    return {
        "response": final_resp,
        "intent": intent_data["intent"],
        "confidence": intent_data["confidence"],
        "language": lang.upper(),
        "requires_clarification": intent_data["requires_clarification"],
        "clarification_question": intent_data["clarification_question"],
        "scheme_id": scheme["id"]
    }
