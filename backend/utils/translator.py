try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None

PLACEHOLDER_TERMS = {
    'LIC': 'LIC',
    'Aadhar': 'Aadhar',
    'Ayushman': 'Ayushman',
    'Golden Card': 'Golden Card',
    'PMVVY': 'PMVVY',
    'PMJJBY': 'PMJJBY',
    'Ayushman Bharat': 'Ayushman Bharat'
}

LANGUAGE_CODE_MAP = {
    'en-in': 'en',
    'en': 'en',
    'hi-in': 'hi',
    'hi': 'hi',
    'kn-in': 'kn',
    'kn': 'kn',
    'ta-in': 'ta',
    'ta': 'ta',
    'te-in': 'te',
    'te': 'te',
    'mr-in': 'mr',
    'mr': 'mr'
}

def translate_text(text: str, target_lang_code: str) -> str:
    """
    Translates English text fully into the requested target language.
    """
    if not text or not text.strip():
        return text

    target = LANGUAGE_CODE_MAP.get(str(target_lang_code).strip().lower(), 'en')
    if target == 'en':
        return text

    if GoogleTranslator is None:
        print('Translation backend not available: deep_translator missing')
        return text

    safe_text = text
    for phrase, token in PLACEHOLDER_TERMS.items():
        safe_text = safe_text.replace(phrase, f'__{phrase}__')

    try:
        translator = GoogleTranslator(source='auto', target=target)
        translated = translator.translate(safe_text)
    except Exception as e:
        print(f"Translation Error: {e}")
        return text

    for phrase, token in PLACEHOLDER_TERMS.items():
        translated = translated.replace(f'__{phrase}__', token)

    return translated
