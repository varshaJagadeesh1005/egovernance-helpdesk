// Localized UI strings for Senior Citizen Helpdesk
export const uiTranslations = {
    "en-IN": {
        "title": "Senior Citizen Helpdesk",
        "tap_and_speak": "Tap and Speak",
        "listening": "Listening...",
        "processing": "Processing your request...",
        "reconnecting": "Reconnecting speech service...",
        "error_mic": "Please allow microphone access to speak.",
        "error_network": "Network issue. Please try again.",
        "error_speech": "I couldn't hear that properly. Please try again.",
        "support_text": "Need help? Tap the microphone and speak.",
        "speak_slowly": "Please speak slowly",
        "retry_msg": "Retrying... please wait",
        "fallback_msg": "Voice failed. Please type your request below.",
        "kannada_detected": "Language automatically detected",
        "type_placeholder": "Type your message here..."
    },
    "kn-IN": {
        "title": "ಹಿರಿಯ ನಾಗರಿಕರ ಸಹಾಯವಾಣಿ",
        "tap_and_speak": "ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ಮಾತನಾಡಿ",
        "listening": "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
        "processing": "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
        "reconnecting": "ಮತ್ತೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
        "error_mic": "ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
        "error_network": "ನೆಟ್‌ವರ್ಕ್ ಸಮಸ್ಯೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        "error_speech": "ನನಗೆ ಸರಿಯಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
        "support_text": "ಸಹಾಯ ಬೇಕೇ? ಮೈಕ್ರೊಫೋನ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ.",
        "speak_slowly": "ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ",
        "retry_msg": "ಮರುಪ್ರಯತ್ನಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಕಾಯಿರಿ",
        "fallback_msg": "ಧ್ವನಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಟೈಪ್ ಮಾಡಿ.",
        "kannada_detected": "ಭಾಷೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಯಾಗಿದೆ",
        "type_placeholder": "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
    },
    "hi-IN": {
        "title": "वरिष्ठ नागरिक हेल्पडेस्क",
        "tap_and_speak": "टैप करें और बोलें",
        "listening": "सुन रहे हैं...",
        "processing": "आपकी बात समझ रहे हैं...",
        "reconnecting": "सेवा फिर से कनेक्ट हो रही है...",
        "error_mic": "कृपया बोलने के लिए माइक्रोफ़ोन की अनुमति दें।",
        "error_network": "नेटवर्क की समस्या। कृपया पुनः प्रयास करें।",
        "error_speech": "मैं ठीक से सुन नहीं पाया। कृपया फिर से बोलें।",
        "support_text": "मदद चाहिए? माइक्रोफ़ोन में बोलें।",
        "speak_slowly": "कृपया धीरे बोलें",
        "retry_msg": "पुनः प्रयास कर रहे हैं... कृपया प्रतीक्षा करें",
        "fallback_msg": "आवाज विफल रही। कृपया अपना प्रश्न नीचे टाइप करें।",
        "kannada_detected": "भाषा स्वचालित रूप से पहचानी गई",
        "type_placeholder": "अपना संदेश यहाँ टाइप करें..."
    }
};

export function getTranslation(langCode, key) {
    if (uiTranslations[langCode] && uiTranslations[langCode][key]) {
        return uiTranslations[langCode][key];
    }
    return uiTranslations["en-IN"][key] || key;
}
