from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

try:
    from googletrans import Translator as GoogleTranslator
except ImportError:
    GoogleTranslator = None

# To ensure consistent results
DetectorFactory.seed = 0

LANGUAGE_DETECTION_MAP = {
    'kn': 'kn-IN',
    'hi': 'hi-IN',
    'en': 'en-IN'
}

def detect_language(text: str) -> str:
    """
    Detects the language of the given text.
    Returns standard language codes: 'en-IN', 'hi-IN', 'kn-IN'.
    Defaults to 'en-IN'.
    """
    if not text or not text.strip():
        return "en-IN"

    text_lower = text.lower()
    kannada_keywords = ["kannada", "namaskara", "namaskara", "hege", "beku", "sahaya", "pension beku"]
    hindi_keywords = ["hindi", "namaste", "kaise", "chahiye", "madad", "karna hai"]
    
    # Check for Kannada characters (Unicode range)
    if any("\u0c80" <= char <= "\u0cff" for char in text):
        return "kn-IN"
        
    # Check for Hindi (Devanagari) characters
    if any("\u0900" <= char <= "\u097f" for char in text):
        return "hi-IN"

    for kw in kannada_keywords:
        if kw in text_lower:
            return "kn-IN"
            
    for kw in hindi_keywords:
        if kw in text_lower:
            return "hi-IN"

    detected_lang = None
    try:
        detected_lang = detect(text)
    except LangDetectException:
        detected_lang = None

    if detected_lang in LANGUAGE_DETECTION_MAP:
        return LANGUAGE_DETECTION_MAP[detected_lang]

    if GoogleTranslator is not None:
        try:
            translator = GoogleTranslator()
            detected = translator.detect(text)
            if detected and detected.lang in LANGUAGE_DETECTION_MAP:
                return LANGUAGE_DETECTION_MAP[detected.lang]
        except Exception:
            pass

    return 'en-IN'
