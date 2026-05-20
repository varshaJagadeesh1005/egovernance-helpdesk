import { uiTranslations, getTranslation } from './translations.js';
import { initVoice, toggleListening, stopListening, speakText, stopSpeaking } from './voice.js';

// DOM Elements
const langSelector = document.getElementById('lang-selector');
const zoomBtn = document.getElementById('zoom-btn');
const appTitle = document.getElementById('app-title');
const toastContainer = document.getElementById('toast-container');
const toastMessage = document.getElementById('toast-message');
const chatContainer = document.getElementById('chat-container');
const welcomeMsg = document.getElementById('welcome-msg');
const textFallback = document.getElementById('text-fallback');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const micStatusLabel = document.getElementById('mic-status-label');
const micBtn = document.getElementById('mic-btn');
const micPulse = document.getElementById('mic-pulse');
const stopAudioBtn = document.getElementById('stop-audio-btn');

let currentLang = 'en-IN';
let currentInterimMessage = null; 

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    // Init Voice
    const voiceSupported = initVoice(onVoiceStateChange, onVoiceResult, onVoiceError);
    if (!voiceSupported) {
        showToast("Speech Recognition not supported in this browser.", true);
        textFallback.classList.remove('hidden');
    }

    // Events
    langSelector.addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateUI();
    });

    zoomBtn.addEventListener('click', () => {
        if (document.body.classList.contains('font-large')) {
            document.body.classList.remove('font-large');
            document.body.classList.add('font-xl');
        } else if (document.body.classList.contains('font-xl')) {
            document.body.classList.remove('font-xl');
        } else {
            document.body.classList.add('font-large');
        }
    });

    micBtn.addEventListener('click', () => {
        stopSpeaking();
        stopAudioBtn.classList.add('hidden');
        toggleListening(currentLang);
    });

    stopAudioBtn.addEventListener('click', () => {
        stopSpeaking();
        stopAudioBtn.classList.add('hidden');
    });

    sendBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            addMessage(text, 'user-msg');
            processUserQuery(text);
            textInput.value = '';
        }
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
});

function updateUI() {
    appTitle.textContent = getTranslation(currentLang, 'title');
    welcomeMsg.textContent = getTranslation(currentLang, 'support_text');
    micStatusLabel.textContent = getTranslation(currentLang, 'tap_and_speak');
    textInput.placeholder = getTranslation(currentLang, 'type_placeholder');
}

function showToast(keyOrText, isRaw = false) {
    const text = isRaw ? keyOrText : getTranslation(currentLang, keyOrText);
    toastMessage.textContent = text;
    toastContainer.classList.remove('hidden');
    setTimeout(() => {
        toastContainer.classList.add('hidden');
    }, 4000);
}

// Voice Callbacks
function onVoiceStateChange(state) {
    if (state === 'listening') {
        micBtn.classList.add('listening');
        micPulse.classList.remove('hidden');
        micStatusLabel.textContent = getTranslation(currentLang, 'speak_slowly');
        showToast('listening');
        currentInterimMessage = null; // reset
    } else if (state === 'retrying') {
        micStatusLabel.textContent = getTranslation(currentLang, 'retry_msg');
        showToast('reconnecting');
    } else if (state === 'stopped') {
        micBtn.classList.remove('listening');
        micPulse.classList.add('hidden');
        micStatusLabel.textContent = getTranslation(currentLang, 'tap_and_speak');
    }
}

function onVoiceResult(interim, final) {
    if (interim) {
        if (!currentInterimMessage) {
            currentInterimMessage = addMessage(interim, 'user-msg');
        } else {
            currentInterimMessage.textContent = interim;
        }
    }
    
    if (final) {
        if (currentInterimMessage) {
            currentInterimMessage.textContent = final;
            currentInterimMessage = null;
        } else {
            addMessage(final, 'user-msg');
        }
        processUserQuery(final);
    }
}

function onVoiceError(type, reason) {
    micBtn.classList.remove('listening');
    micPulse.classList.add('hidden');
    micStatusLabel.textContent = getTranslation(currentLang, 'tap_and_speak');

    if (type === 'mic_denied') {
        showToast('error_mic');
        textFallback.classList.remove('hidden');
    } else if (type === 'fallback') {
        if (reason === 'network') showToast('error_network');
        else showToast('error_speech');
        
        showToast('fallback_msg');
        textFallback.classList.remove('hidden');
    }
}

function addMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    const p = document.createElement('p');
    
    p.innerHTML = text.replace(/\n/g, '<br>');
    
    msgDiv.appendChild(p);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return p;
}

async function processUserQuery(query) {
    showToast('processing');
    micStatusLabel.textContent = getTranslation(currentLang, 'processing');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                language: currentLang
            })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        
        addMessage(data.response, 'system-msg');
        micStatusLabel.textContent = getTranslation(currentLang, 'tap_and_speak');
        
        // Ensure language dropdown is updated if backend auto-detected something else
        if (data.language && data.language !== currentLang) {
            currentLang = data.language;
            langSelector.value = currentLang;
            updateUI();
            showToast('kannada_detected'); // Or equivalent language detection toast
        }
        
        if (data.spoken_response) {
            stopAudioBtn.classList.remove('hidden');
            speakText(data.spoken_response, currentLang);
        }
        
    } catch (error) {
        console.error("API Error:", error);
        addMessage("Sorry, we are unable to reach the server. Please try again.", 'system-msg');
        micStatusLabel.textContent = getTranslation(currentLang, 'tap_and_speak');
    }
}
