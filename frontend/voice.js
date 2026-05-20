// Voice processing module - STT and TTS
import { getTranslation } from './translations.js';

let recognition = null;
let isListening = false;
let retryCount = 0;
const MAX_RETRIES = 2;

// Callbacks
let onStateChange = null;
let onResult = null;
let onError = null;

export function initVoice(stateCallback, resultCallback, errorCallback) {
    onStateChange = stateCallback;
    onResult = resultCallback;
    onError = errorCallback;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        if (onError) onError("unsupported");
        return false;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false; // We want it to stop after a phrase so we can process it
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        retryCount = 0;
        if (onStateChange) onStateChange('listening');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        if (onResult) onResult(interimTranscript, finalTranscript);
        
        if (finalTranscript !== '') {
            stopListening(); // Auto stop once we have a final phrase
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isListening = false;
            if (onError) onError('mic_denied');
        } else if (event.error === 'network') {
            handleRetry('network');
        } else if (event.error === 'no-speech') {
            handleRetry('no_speech');
        } else {
            handleRetry('generic');
        }
    };

    recognition.onend = () => {
        isListening = false;
        if (onStateChange) onStateChange('stopped');
    };

    return true;
}

function handleRetry(reason) {
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        if (onStateChange) onStateChange('retrying');
        console.log(`Retrying recognition (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => {
            try {
                recognition.start();
            } catch(e) {}
        }, 1000);
    } else {
        isListening = false;
        if (onError) onError('fallback', reason);
    }
}

export function startListening(langCode) {
    if (!recognition) return;
    try {
        recognition.lang = langCode;
        recognition.start();
    } catch (e) {
        console.warn("Recognition already started or error:", e);
    }
}

export function stopListening() {
    if (!recognition) return;
    try {
        recognition.stop();
    } catch (e) {}
}

export function toggleListening(langCode) {
    if (isListening) {
        stopListening();
    } else {
        startListening(langCode);
    }
}

// Text to Speech
export function speakText(text, langCode) {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Elder friendly settings
    utterance.rate = 0.8; // Slow pace
    utterance.pitch = 1.0;
    
    // Map our lang codes to synthesis lang codes
    utterance.lang = langCode;

    // Try to find a female voice for this language
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    const prefix = langCode.split('-')[0];
    const possibleVoices = voices.filter(v => v.lang === langCode || v.lang.startsWith(prefix));
    
    if (possibleVoices.length > 0) {
        const femaleVoice = possibleVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('pallavi'));
        selectedVoice = femaleVoice || possibleVoices[0];
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
