import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  Phone, 
  Accessibility, 
  RotateCcw, 
  Bookmark, 
  CheckSquare, 
  HelpCircle, 
  UserCheck, 
  Sun, 
  Moon 
} from 'lucide-react';
import axios from 'axios';

// Local fallback dictionary for offline/pre-backend compatibility
const LOCAL_SCHEMES_DB = {
  ignoaps: {
    name: "Indira Gandhi National Old Age Pension Scheme",
    simplified_name: "Monthly Old Age Pension",
    category: "Pensions",
    steps: [
      { step_number: 1, action: "Get your documents ready", explanation: "Find your Aadhar card, BPL card, and bank passbook. Take clear photos of them with your mobile phone if applying online.", voice_command: "Say: 'Help me check my documents'" },
      { step_number: 2, action: "Visit Gram Panchayat or Welfare Office", explanation: "Go to the local office. Ask the officer for the 'Old Age Pension Application Form'. You can also download it online.", voice_command: "Say: 'Where is my nearest pension office?'" },
      { step_number: 3, action: "Fill out the form carefully", explanation: "Write down your name, age, address, and bank account number carefully. The welfare officer will help you fill it for free.", voice_command: "Say: 'Tell me how to fill the form'" },
      { step_number: 4, action: "Submit and get your receipt", explanation: "Hand over the filled form along with copies of your documents. Make sure to get a printed receipt or application number from the officer.", voice_command: "Say: 'Track my pension status'" }
    ],
    documents: [
      { name: "Aadhar Card", purpose: "To prove your age and identity" },
      { name: "BPL Ration Card", purpose: "To prove your family needs financial help" },
      { name: "Bank Passbook", purpose: "To send the monthly money directly to your account" }
    ],
    contact: { helpline: "1800-111-222", office: "Social Welfare Department, Block BDO", website: "nsap.nic.in" }
  },
  pmvvy: {
    name: "Pradhan Mantri Vaya Vandana Yojana",
    simplified_name: "Government Monthly Income Savings Scheme",
    category: "Financial",
    steps: [
      { step_number: 1, action: "Decide your savings amount", explanation: "You can invest a minimum of one lakh fifty thousand rupees up to fifteen lakh rupees to get a safe monthly interest return.", voice_command: "Say: 'How much money should I invest?'" },
      { step_number: 2, action: "Visit nearest LIC Office", explanation: "Life Insurance Corporation (LIC) runs this scheme. Visit the nearest LIC branch or ask a helper to open their website.", voice_command: "Say: 'Find nearest LIC branch'" },
      { step_number: 3, action: "Fill out the PMVVY savings form", explanation: "Provide your personal details, nominee details, and select 'Monthly' interest payout option.", voice_command: "Say: 'Explain PMVVY form details'" },
      { step_number: 4, action: "Submit investment check", explanation: "Write a check for your selected savings amount and submit it with the form. Keep the official receipt very safe.", voice_command: "Say: 'How to pay the investment amount?'" }
    ],
    documents: [
      { name: "Aadhar Card", purpose: "To verify your age and eligibility" },
      { name: "PAN Card", purpose: "Required for standard savings account setup" },
      { name: "Bank Passbook", purpose: "To deposit your monthly interest directly" }
    ],
    contact: { helpline: "1800-227-712", office: "Any Life Insurance Corporation (LIC) branch", website: "licindia.in" }
  },
  pmjay: {
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    simplified_name: "Free Golden Health Card",
    category: "Health",
    steps: [
      { step_number: 1, action: "Check your name on the list", explanation: "Open the official portal pmjay.gov.in or click 'Am I Eligible' inside our helper. Input your mobile number and Aadhar card details.", voice_command: "Say: 'Check my Ayushman eligibility'" },
      { step_number: 2, action: "Visit nearest Common Service Center (CSC)", explanation: "Go to the nearest digital cyber kiosk or CSC in your village/town, or visit the Ayushman Helpdesk at any large government hospital.", voice_command: "Say: 'Find nearby common service center'" },
      { step_number: 3, action: "Get your biometrics verified", explanation: "Show your Aadhar card and place your thumb on the scanning machine to confirm your identity. The center operator will generate your card.", voice_command: "Say: 'How to verify finger print?'" },
      { step_number: 4, action: "Collect your Golden Card", explanation: "The operator will print a plastic laminated green-colored 'Ayushman Card' for you. Show this card at any listed hospital to get fully free treatment.", voice_command: "Say: 'Show my golden card details'" }
    ],
    documents: [
      { name: "Aadhar Card", purpose: "To check your name in the beneficiary list" },
      { name: "Ration Card", purpose: "To verify your family members" }
    ],
    contact: { helpline: "14555", office: "Ayushman Help Desk in any Empanelled Hospital", website: "pmjay.gov.in" }
  }
};

const SUGGESTIONS = [
  { text: "I want to apply for my old age pension", label: "Apply for Pension" },
  { text: "How do I get the free Golden Health Card?", label: "Free Health Card" },
  { text: "Tell me about LIC Monthly Savings Scheme (PMVVY)", label: "LIC Savings Scheme" },
  { text: "My Aadhar card is lost. Help me.", label: "Lost Aadhar Card" },
  { text: "How do I check my bank account online?", label: "Online Banking" }
];

const TRANSLATED_TEMPLATES = {
  hindi: {
    greeting: "नमस्ते! मुझे आपकी मदद करने में बहुत खुशी हो रही है।",
    what_i_help: "मैं आपको इस योजना के बारे में बहुत आसान तरीके से समझाऊंगा।",
    summary: "मैं सरकारी योजनाओं को आपके लिए सरल भाषा में समझाऊंगा।",
    next_step: "क्या आप हमारे किसी मददगार साथी से सीधे बात करना चाहेंगे? या मैं आपको अन्य कागजातों के बारे में बताऊं?"
  },
  tamil: {
    greeting: "வணக்கம்! உங்களுக்கு உதவுவதில் நான் மிகவும் மகிழ்ச்சியடைகிறேன்.",
    what_i_help: "இந்த திட்டத்தைப் பற்றி உங்களுக்கு எளிய முறையில் விளக்குகிறேன்.",
    summary: "இந்த திட்டங்களை உங்கள் பயனுக்கு எளிதாக விளக்குகிறேன்.",
    next_step: "எங்கள் குழு உறுப்பினருடன் பேச விரும்புகிறீர்களா? அல்லது தேவையான ஆவணங்களை விளக்கவா?"
  },
  telugu: {
    greeting: "నమస్కారం! మీకు సహాయం చేయడం నాకు చాలా సంతోషంగా ఉంది.",
    what_i_help: "ఈ పథకం గురించి మీకు చాలా సులభంగా వివరిస్తాను.",
    summary: "నేను ఈ పథకాలను మీకోసం సులభంగా వివరించగలను.",
    next_step: "మా బృంద సభ్యులతో మాట్లాడాలనుకుంటున్నారా? లేదా కావాల్సిన పత్రాల గురించి వివరించనా?"
  },
  kannada: {
    greeting: "ನಮಸ್ಕಾರ! ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನನಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.",
    what_i_help: "ಈ ಯೋಜನೆಯ ಬಗ್ಗೆ ನಿಮಗೆ ಸುಲಭವಾಗಿ ತಿಳಿಸಿಕೊಡುತ್ತೇನೆ.",
    summary: "ಈ ಯೋಜನೆಗಳನ್ನು ನಿಮಗಾಗಿ ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.",
    next_step: "ನಮ್ಮ ತಂಡದ ಸಿಬ್ಬಂದಿಯೊಂದಿಗೆ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ? ಅಥವಾ ಬೇಕಾದ ದಾಖಲೆಗಳನ್ನು ವಿವರಿಸಬೇಕೆ?"
  },
  marathi: {
    greeting: "नमस्कार! मला तुमची मदत करायला खूप आनंद होत आहे.",
    what_i_help: "मी तुम्हाला या योजनेबद्दल अत्यंत सोप्या भाषेत माहिती देतो.",
    summary: "मी या योजनेचे स्पष्टीकरण आपल्यासाठी खूप सोप्या भाषेत करीन.",
    next_step: "तुम्हाला आमच्या टीममधील सहकाऱ्याशी बोलायला आवडेल का? की लागणारी कागदपत्रे समजावून सांगू?"
  }
};

function App() {


  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      isStructured: true,
      data: {
        greeting: "Namaste! I am your E-Governance helpdesk assistant. I am here to help you get pension, healthcare, and document services easily.",
        whatIHelp: "Ask me a question or click one of the big colored cards below to start!",
        steps: [],
        summary: "I will make government rules super easy for you. No technical jargon, just simple steps.",
        nextStep: "Would you like to ask about pension schemes, health cards, or savings schemes?"
      }
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('egov_language') || 'english';
    }
    return 'english';
  });

  const LANGUAGE_CODES = {
    english: 'en-IN',
    hindi: 'hi-IN',
    tamil: 'ta-IN',
    telugu: 'te-IN',
    kannada: 'kn-IN',
    marathi: 'mr-IN'
  };

  const LANGUAGE_CODE_TO_NAME = {
    'en-IN': 'english',
    'hi-IN': 'hindi',
    'ta-IN': 'tamil',
    'te-IN': 'telugu',
    'kn-IN': 'kannada',
    'mr-IN': 'marathi'
  };

  const UI_TEXTS = {
    english: {
      subtitle: 'Simple Government Help for Seniors (65+)',
      chatTitle: 'Your Friendly Chatbot Assistant',
      exploreTitle: 'Explore Government Schemes',
      checkDocuments: 'Check your documents:',
      showSteps: 'Show Me Simple Steps',
      commonQuestions: 'Common Questions',
      supportTitle: 'Confused or stuck? No worries!',
      supportText: 'Click the red call button below to talk directly with a friendly guide who will fill the form for you.',
      callButton: 'Call Helper Toll-Free: 1800-200-3333'
    },
    kannada: {
      subtitle: 'ಮುಖ್ಯವಾಗಿ ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಸರಳ ಸರ್ಕಾರಿ ಸಹಾಯ',
      chatTitle: 'ನಿಮ್ಮ ಸ್ನೇಹಿ ಚಾಟ್‌ಬಾಟ್ ಸಹಾಯಕ',
      exploreTitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
      checkDocuments: 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:',
      showSteps: 'ನನಗೆ ಸರಳ ಹಂತಗಳನ್ನು ತೋರಿಸಿ',
      commonQuestions: 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',
      supportTitle: 'ಗೊಂದಲವಿದೆಯೆ? ಚಿಂತೆ ಬೇಡ!',
      supportText: 'ನೀವು ಬಲಗಿನ ಕೆಂಪು ಕರೆ ಬಟನ್ ಒತ್ತಿ ಮತ್ತು ದಯವಿಟ್ಟು ತಿಳಿದಿರುವ ಸಹಾಯಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      callButton: 'ಉಚಿತ ಕರೆದಿರಿ: 1800-200-3333'
    }
  };

  const getUIText = (key, lang) => {
    const textSet = UI_TEXTS[lang] || UI_TEXTS.english;
    return textSet[key] || UI_TEXTS.english[key] || '';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('egov_language', selectedLanguage);
    }
  }, [selectedLanguage]);

  const getInitialAssistantData = (lang) => {
    const defaultData = {
      greeting: "Namaste! I am your E-Governance helpdesk assistant. I am here to help you get pension, healthcare, and document services easily.",
      whatIHelp: "Ask me a question or click one of the big colored cards below to start!",
      steps: [],
      summary: "I will make government rules super easy for you. No technical jargon, just simple steps.",
      nextStep: "Would you like to ask about pension schemes, health cards, or savings schemes?"
    };

    if (lang === 'english' || !TRANSLATED_TEMPLATES[lang]) {
      return defaultData;
    }

    const template = TRANSLATED_TEMPLATES[lang];
    return {
      greeting: template.greeting,
      whatIHelp: template.what_i_help,
      steps: [],
      summary: template.summary,
      nextStep: template.next_step
    };
  };

  const getChatPlaceholder = (lang) => {
    switch (lang) {
      case 'hindi': return "अपना प्रश्न यहाँ टाइप करें (उदा: पेंशन कैसे लें?)...";
      case 'tamil': return "உங்கள் கேள்வியை இங்கே টাইப் செய்யவும் (எ.கா: ஓய்வு 계획ம் எப்படி பெறுவது?)...";
      case 'telugu': return "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి (ఉదా: పెన్షన్ ఎలా పొందాలి?)...";
      case 'kannada': return "ಇಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಪಿಂಚನ್ ಹೇಗೆ ಪಡೆಯುವುದು?)...";
      case 'marathi': return "इथे आपला प्रश्न टाइप करा (उदा.: पेन्शन कसे घ्यावे?)...";
      default: return "Type your question here (e.g. How to get pension?)...";
    }
  };

  const getMicStatusText = (lang, listening) => {
    if (listening) {
      switch (lang) {
        case 'hindi': return "सुन रहा हूँ... अब अपनी प्रश्न बोलें.";
        case 'tamil': return "கேட்கிறேன்... இப்போது உங்கள் கேள்வியைப் பேசுங்கள்.";
        case 'telugu': return "వింటుతున్నాం... ఇప్పుడు మీ ప్రశ్నను మాట్లాడండి.";
        case 'kannada': return "ಲಿಸನಿಂಗ್... ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಈಗ ಹೇಳಿ.";
        case 'marathi': return "ऐकत आहे... आता आपला प्रश्न बोला.";
        default: return "Listening... Speak your question now.";
      }
    }

    switch (lang) {
      case 'hindi': return "लाल माइक्रोफ़ोन दबाएँ और प्राकृतिक रूप से बोलें!";
      case 'tamil': return "பார்வையான சிவப்பு மைக்ரோஃபோனைக் கிளிக் செய்து பேசவும்!";
      case 'telugu': return "రక్తాన్ని నొక్కి ప్రశ్నను సహజంగా మాట్లాడండి!";
      case 'kannada': return "ದೊಡ್ಡ ಕೆಂಪು ಮೈಕ್ ಅನ್ನು ಒತ್ತಿ ಮತ್ತು ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ!";
      case 'marathi': return "मोठ्या लाल माइकवर टॅप करा आणि नैसर्गिकपणे बोला!";
      default: return "Tap the big red mic and speak naturally!";
    }
  };

  useEffect(() => {
    setMessages(prev => prev.map((msg, index) => {
      if (index !== 0 || msg.sender !== 'assistant' || !msg.isStructured) return msg;
      return {
        ...msg,
        data: getInitialAssistantData(selectedLanguage)
      };
    }));
  }, [selectedLanguage]);
  const [textSizeMode, setTextSizeMode] = useState('normal'); // 'normal', 'lg', 'xl'
  const [themeMode, setThemeMode] = useState('light');
  const [isListening, setIsListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(true);
  const [activeSchemeTab, setActiveSchemeTab] = useState('ignoaps');
  const [voiceDebug, setVoiceDebug] = useState({ ok: true, error: '', message: '', ts: 0 });

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionRetryCountRef = useRef(0);
  const recognitionMaxRetries = 2; // auto-retry speech recognition on transient errors


  // Scroll to bottom on new chat message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up Speech Recognition on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      // Important: WebKit speech recognition needs a language like 'en-IN'
      rec.lang = 'en-IN'; // Default to Indian English, dynamically customizable
      // Improve compatibility on some browsers
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsListening(false);

        const code = e?.error;
        const baseMsg = "Pardon me, I couldn't hear that properly.";

        // Known Web Speech API error codes:
        // 'not-allowed' (mic permission), 'service-not-allowed', 'no-speech', 'audio-capture', 'network', etc.
        let reasonMsg = "";
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          reasonMsg = " Please allow microphone permission in your browser.";
        } else if (code === 'no-speech') {
          reasonMsg = " Please speak a little louder and clearly.";
        } else if (code === 'network') {
          reasonMsg = " Speech service is having trouble connecting.";
        } else if (code === 'audio-capture') {
          reasonMsg = " No microphone input detected.";
        }

        setVoiceDebug({
          ok: false,
          error: code || 'unknown',
          message: baseMsg + reasonMsg,
          ts: Date.now()
        });

        // Auto-retry on transient errors only (network / no-speech / audio-capture)
        const canRetry = (code === 'network' || code === 'no-speech' || code === 'audio-capture');
        if (canRetry && recognitionRetryCountRef.current < recognitionMaxRetries) {
          recognitionRetryCountRef.current += 1;

          // Small delay so the mic can settle before retry
          setTimeout(() => {
            try {
              window.speechSynthesis?.cancel?.();
              if (recognitionRef.current) {
                // Make sure language is applied before start
                if (selectedLanguage === 'hindi') recognitionRef.current.lang = 'hi-IN';
                else if (selectedLanguage === 'tamil') recognitionRef.current.lang = 'ta-IN';
                else if (selectedLanguage === 'telugu') recognitionRef.current.lang = 'te-IN';
                else if (selectedLanguage === 'kannada') recognitionRef.current.lang = 'kn-IN';
                else if (selectedLanguage === 'marathi') recognitionRef.current.lang = 'mr-IN';
                else recognitionRef.current.lang = 'en-IN';

                recognitionRef.current.start();
              }
            } catch (err) {
              console.warn('Speech recognition retry failed', err);
              alert(baseMsg + reasonMsg);
            }
          }, 400);

          return;
        }

        // Reset retry counter when we give up
        recognitionRetryCountRef.current = 0;
        alert(baseMsg + reasonMsg);
      };
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendQuery(transcript);
      };
      recognitionRef.current = rec;
    }
  }, [selectedLanguage]);

  // Speak response out loud using Web Speech Synthesis
  const speakText = (textToSpeak) => {
    if (!speakOn) return;
    window.speechSynthesis.cancel(); // Stop any currently speaking voice
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.85; // Speak slower for seniors (standard is 1.0)
    utterance.pitch = 1.0;
    
    // Choose appropriate voice/language code
    if (selectedLanguage === 'hindi') utterance.lang = 'hi-IN';
    else if (selectedLanguage === 'tamil') utterance.lang = 'ta-IN';
    else if (selectedLanguage === 'telugu') utterance.lang = 'te-IN';
    else if (selectedLanguage === 'kannada') utterance.lang = 'kn-IN';
    else if (selectedLanguage === 'marathi') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';

    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (recognitionRef.current) {
      // Some browsers require resetting SpeechRecognition instance after language change.
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      if (lang === 'hindi') recognitionRef.current.lang = 'hi-IN';
      else if (lang === 'tamil') recognitionRef.current.lang = 'ta-IN';
      else if (lang === 'telugu') recognitionRef.current.lang = 'te-IN';
      else if (lang === 'kannada') recognitionRef.current.lang = 'kn-IN';
      else if (lang === 'marathi') recognitionRef.current.lang = 'mr-IN';
      else recognitionRef.current.lang = 'en-IN';
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("I'm sorry, voice speaking is not supported on this browser. Try using the typed chat or clicking a quick card instead!");
      return;
    }

    // If user manually starts a new recording, reset retry counter
    recognitionRetryCountRef.current = 0;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop any output speaking while listening
      recognitionRef.current.start();
    }
  };

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    // Add user query to chat history
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputText('');

    try {
      // Attempt backend FastAPI server call
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${apiUrl}/api/chat`, {
        query: textToSend,
        language: LANGUAGE_CODES[selectedLanguage] || 'en-IN'
      });
      
      const result = response.data;
      const serverLang = LANGUAGE_CODE_TO_NAME[result.language] || selectedLanguage;
      if (serverLang !== selectedLanguage) {
        setSelectedLanguage(serverLang);
      }
      parseAndAddAssistantMessage(result.response);
    } catch (error) {
      console.warn("Backend server not reached. Processing local semantic matching.", error);
      // Fallback: Local matching algorithm
      const localResult = processLocalQuery(textToSend, selectedLanguage);
      parseAndAddAssistantMessage(localResult);
    }
  };

  // Local intent matching algorithm for offline robustness
  const processLocalQuery = (query, lang) => {
    const qLower = query.toLowerCase();
    let schemeKey = null;

    if (qLower.includes("pension") || qLower.includes("old age") || qLower.includes("money") || qLower.includes("paise") || qLower.includes("pension beku") || qLower.includes("pension chahiye")) {
      if (qLower.includes("lic") || qLower.includes("savings") || qLower.includes("pmvvy") || qLower.includes("vaya")) {
        schemeKey = "pmvvy";
      } else {
        schemeKey = "ignoaps";
      }
    } else if (qLower.includes("health") || qLower.includes("hospital") || qLower.includes("ayushman") || qLower.includes("golden") || qLower.includes("treatment")) {
      schemeKey = "pmjay";
    }

    const localizedFallback = {
      english: {
        greeting: "Hello! I want to make sure I understand your query correctly.",
        help: "I can help you with pensions, free golden health cards, and LIC monthly savings.",
        step: "STEP 1: Pick a topic to start\n        - Ask: 'I want to apply for a pension' or 'Explain Ayushman card'.\n        - Say: 'Tell me about pensions'",
        summary: "I've offered you topics you can ask me about.",
        next: "Would you like me to connect you with our call support? Or should I explain pensions?"
      },
      kannada: {
        greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಿಖರವಾಗಿ ತಿಳಿದುಕೊಳ್ಳಲು ಪ್ರಯತ್ನಿಸುತ್ತಿದ್ದೇನೆ.",
        help: "ನಾನು ನಿಮಗೆ ಪಿಂಚಣಿ, ಉಚಿತ ಗೋಲ್ಡ್ ಹೆಲ್ತ್ ಕಾರ್ಡ್ ಮತ್ತು LIC ಉಳಿತಾಯ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
        step: "ಹಂತ 1: ಪ್ರಾರಂಭಿಸಲು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ\n        - ಕೇಳಿ: 'ನನಗೆ ಪಿಂಚಣಿ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕಿದೆ' ಅಥವಾ 'ಆಯುಷ್ಮಾನ್ ಕಾರ್ಡ್ ಬಗ್ಗೆ ವಿವರಿಸಿ'.\n        - ಹೇಳಿ: 'ನನಗೆ ಪಿಂಚಣಿ ಬಗ್ಗೆ ತಿಳಿಸಿ'",
        summary: "ನಾನು ನಿಮಗೆ ಕೇಳಲಾದ ವಿಷಯಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.",
        next: "ನಾನು ನಿಮಗೆ ನಮ್ಮ ಸಹಾಯವಾಣಿ ಮೂಲಕ ಸಂಪರ್ಕಿಸಬಹುದೇ? ಅಥವಾ ನಾನು ಪಿಂಚಣಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸೋಣ?"
      },
      hindi: {
        greeting: "नमस्ते! मैं आपकी बात सही से समझना चाह रहा हूँ।",
        help: "मैं आपको पेंशन, मुफ्त गोल्डन हेल्थ कार्ड, और LIC बचत योजनाओं में मदद कर सकता हूँ।",
        step: "चरण 1: एक विषय चुनें\n        - पूछें: 'मुझे पेंशन के लिए आवेदन करना है' या 'आयुष्मान कार्ड के बारे में बताओ'.\n        - कहें: 'मुझे पेंशन के बारे में बताएं'",
        summary: "मैंने आपको उन विषयों की जानकारी दी जिनके बारे में आप पूछ सकते हैं।",
        next: "क्या मैं आपको हमारी हेल्पडेस्क कॉल के साथ कनेक्ट करूं? या क्या मैं पेंशन समझाऊँ?"
      }
    };

    if (!scheme) {
      const fallback = localizedFallback[lang] || localizedFallback.english;
      return `GREETING: "${fallback.greeting}"\n\n` +
             `WHAT I'LL HELP: "${fallback.help}"\n\n` +
             `${fallback.step}\n\n` +
             `SUMMARY: "${fallback.summary}"\n\n` +
             `NEXT STEP: "${fallback.next}"`;
    }

    const schemeName = scheme.simplified_name;
    const messages = {
      english: {
        greeting: "Hello! I am so happy to help you find information about the government's schemes today.",
        help: `I will show you simple, easy steps to understand and apply for the ${schemeName}.`,
        summary: `Once you complete these simple steps, you will get your ${schemeName} set up safely!`,
        next: "Would you like to speak with a helpful member of our team? Or should I explain the documents you need?"
      },
      kannada: {
        greeting: "ನಮಸ್ಕಾರ! ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನನಗೆ ತುಂಬಾ ಸಂತೋಷವಾಗಿದೆ.",
        help: `ನಾನು ನಿಮಗೆ ${schemeName} ಬಗ್ಗೆ ಸುಲಭವಾಗಿ ತಿಳಿಸಿಕೊಡುತ್ತೇನೆ.`,
        summary: `ನೀವು ಈ ಸರಳ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ಮೇಲೆ, ನಿಮ್ಮ ${schemeName} ಸುರಕ್ಷಿತವಾಗಿ ಸಿದ್ಧವಾಗುತ್ತದೆ!`,
        next: "ನಾನು ನಿಮಗೆ ನಮ್ಮ ಸಹಾಯವಾಣಿ ಮೂಲಕ ಸಂಪರ್ಕಿಸಬಹುದೇ? ಅಥವಾ ನಾನು ಪಿಂಚಣಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸೋಣ?"
      },
      hindi: {
        greeting: "नमस्ते! मुझे आपकी मदद करने में बहुत खुशी हो रही है।",
        help: `मैं आपको ${schemeName} के बारे में सरल तरीके से समझाऊंगा।`,
        summary: `इन सरल चरणों को पूरा करने पर आपका ${schemeName} सुरक्षित रूप से तैयार हो जाएगा।`,
        next: "क्या आप हमारी टीम के किसी सदस्य से बात करना चाहेंगे? या क्या मैं आपको प्रक्रिया समझाऊँ?"
      }
    };

    const base = messages[lang] || messages.english;
    const stepsStr = scheme.steps.map(s => 
      `STEP ${s.step_number}: ${s.action}\n` +
      `        - ${s.explanation}\n` +
      `        - ${s.voice_command}`
    ).join("\n\n");

    return `GREETING: "${base.greeting}"\n\n` +
           `WHAT I'LL HELP: "${base.help}"\n\n` +
           `${stepsStr}\n\n` +
           `SUMMARY: "${base.summary}"\n\n` +
           `NEXT STEP: "${base.next}"`;
  };

  // Helper to parse the raw structured text (with sections) and store as clean state object
  const parseAndAddAssistantMessage = (rawText) => {
    const greetingMatch = rawText.match(/GREETING:\s*"([^"]+)"/);
    const helpMatch = rawText.match(/WHAT I'LL HELP:\s*"([^"]+)"/);
    const summaryMatch = rawText.match(/SUMMARY:\s*"([^"]+)"/);
    const nextStepMatch = rawText.match(/NEXT STEP:\s*"([^"]+)"/);

    const steps = [];
    const stepRegex = /STEP\s+(\d+):\s*([^\n]+)\n\s+-\s*([^\n]+)\n\s+-\s*([^\n]+)/g;
    let match;
    while ((match = stepRegex.exec(rawText)) !== null) {
      steps.push({
        number: match[1],
        title: match[2],
        explanation: match[3],
        voiceCommand: match[4]
      });
    }

    const parsedData = {
      greeting: greetingMatch ? greetingMatch[1] : "Hello! Let me explain this for you.",
      whatIHelp: helpMatch ? helpMatch[1] : "Here are the details you requested.",
      steps: steps,
      summary: summaryMatch ? summaryMatch[1] : "",
      nextStep: nextStepMatch ? nextStepMatch[1] : "Would you like more help?"
    };

    setMessages(prev => [...prev, {
      sender: 'assistant',
      isStructured: true,
      data: parsedData
    }]);

    // Synthesize response audio
    const audioText = `${parsedData.greeting}. ${parsedData.whatIHelp}. ${steps.length > 0 ? "Here are the steps:" : ""} ${steps.map(s => `Step ${s.number}: ${s.title}. ${s.explanation}`).join(" ")} ${parsedData.summary}. ${parsedData.nextStep}`;
    speakText(audioText);
  };

  const currentScheme = LOCAL_SCHEMES_DB[activeSchemeTab];

  return (
    <div className={`app-container ${textSizeMode === 'lg' ? 'text-lg-mode' : textSizeMode === 'xl' ? 'text-xl-mode' : ''} ${themeMode === 'dark' ? 'dark-mode' : ''}`}>
      
      {/* Top Banner & Header */}
      <header className="header-wrapper" role="banner">
        <div className="header-top">
          <div className="brand-section">
            <div className="logo-badge" aria-hidden="true">सेवा</div>
            <div>
              <h1 className="header-title">E-Governance Helpdesk</h1>
              <p className="header-subtitle">{getUIText('subtitle', selectedLanguage)}</p>
            </div>
          </div>
          
          {/* Accessibility controls */}
          <div className="accessibility-controls">
            <button 
              className="acc-btn" 
              onClick={() => setTextSizeMode(prev => prev === 'normal' ? 'lg' : prev === 'lg' ? 'xl' : 'normal')}
              aria-label="Adjust Text Size"
              title="Make Text Larger"
            >
              <Accessibility size={20} />
              <span>Text Size: <strong className="size-indicator">{textSizeMode.toUpperCase()}</strong></span>
            </button>

            <button 
              className="acc-btn" 
              onClick={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')}
              aria-label="Toggle High Contrast Dark Theme"
              title="Change Contrast Colors"
            >
              {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{themeMode === 'light' ? "Dark Theme" : "Light Theme"}</span>
            </button>

            <button 
              className="acc-btn"
              onClick={() => setSpeakOn(prev => !prev)}
              aria-label="Toggle voice output speaking"
              title="Toggle text reading voice output"
            >
              {speakOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span>{speakOn ? "Voice: ON" : "Voice: OFF"}</span>
            </button>
          </div>
        </div>

        {/* 5 Indian Languages Selection Bar */}
        <nav className="language-selector" aria-label="Language options">
          <button className={`lang-btn ${selectedLanguage === 'english' ? 'active' : ''}`} onClick={() => handleLanguageChange('english')}>English</button>
          <button className={`lang-btn ${selectedLanguage === 'hindi' ? 'active' : ''}`} onClick={() => handleLanguageChange('hindi')}>हिन्दी (Hindi)</button>
          <button className={`lang-btn ${selectedLanguage === 'tamil' ? 'active' : ''}`} onClick={() => handleLanguageChange('tamil')}>தமிழ் (Tamil)</button>
          <button className={`lang-btn ${selectedLanguage === 'telugu' ? 'active' : ''}`} onClick={() => handleLanguageChange('telugu')}>తెలుగు (Telugu)</button>
          <button className={`lang-btn ${selectedLanguage === 'kannada' ? 'active' : ''}`} onClick={() => handleLanguageChange('kannada')}>ಕನ್ನಡ (Kannada)</button>
          <button className={`lang-btn ${selectedLanguage === 'marathi' ? 'active' : ''}`} onClick={() => handleLanguageChange('marathi')}>मराठी (Marathi)</button>
        </nav>
      </header>

      {/* Main Content Dashboard */}
      <main className="dashboard-grid">
        
        {/* Left Side: Intelligent Conversational Engine */}
        <section className="card" aria-labelledby="chat-title">
          <h2 id="chat-title" className="card-title">
            <UserCheck size={28} className="icon-main" />
            <span>{getUIText('chatTitle', selectedLanguage)}</span>
          </h2>
            {/* Messages area */}
            <div className="chat-history">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble ${msg.sender}`}>
                  {msg.isStructured ? (
                    <div className="structured-response">
                      <p className="sr-greeting">{msg.data.greeting}</p>
                      <p className="sr-help">➔ {msg.data.whatIHelp}</p>
                      
                      {msg.data.steps && msg.data.steps.map((st, i) => (
                        <div key={i} className="sr-step-box">
                          <p className="sr-step-title">Step {st.number}: {st.title}</p>
                          <p className="sr-step-explanation">{st.explanation}</p>
                          <span className="sr-step-voice">{st.voiceCommand}</span>
                        </div>
                      ))}

                      {msg.data.summary && <p className="sr-summary">{msg.data.summary}</p>}
                      <p className="sr-next-step">💡 Next Option: {msg.data.nextStep}</p>
                    </div>
                  ) : (
                    <p style={{ fontWeight: '500' }}>{msg.text}</p>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Control Input & Buttons */}
            <div className="chat-controls">
              <input 
                type="text" 
                className="chat-input"
                placeholder={getChatPlaceholder(selectedLanguage)}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendQuery(); }}
                aria-label="Type question"
              />
              <button 
                className="send-btn" 
                onClick={() => handleSendQuery()} 
                aria-label="Send Query"
                title="Submit typed query"
              >
                <Send size={24} />
              </button>
            </div>

            {/* Voice Mic Interface Container */}
            <div className="mic-btn-container">
              <button 
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleMicClick}
                aria-label={isListening ? "Listening - Click to stop recording" : "Speak - Click to record voice query"}
                title="Tap and speak your query"
              >
                {isListening ? <Mic size={40} /> : <MicOff size={40} />}
              </button>
              <p className="mic-status-text">
                {getMicStatusText(selectedLanguage, isListening)}
              </p>
              <div className="voice-debug" aria-live="polite" style={{ fontSize: '12px', color: voiceDebug.ok ? 'transparent' : '#ef4444', marginTop: '6px' }}>
                {!voiceDebug.ok ? `Voice error (${voiceDebug.error}): ${voiceDebug.message}` : ''}
              </div>
            </div>
        </section>

        {/* Right Side: Quick Document Guide & Common Suggestions */}
        <div style={{ display: 'flex', flex: '1', flexDirection: 'column', gap: '32px' }}>
          
          {/* Quick Schemes and Documents Checklist */}
          <section className="card" aria-labelledby="schemes-title">
            <h2 id="schemes-title" className="card-title">
              <Bookmark size={28} />
              <span>{getUIText('exploreTitle', selectedLanguage)}</span>
            </h2>

            {/* Sub-navigation tabs for schemes */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              <button 
                className={`acc-btn ${activeSchemeTab === 'ignoaps' ? 'active' : ''}`}
                style={{ backgroundColor: activeSchemeTab === 'ignoaps' ? 'var(--accent)' : 'transparent', color: activeSchemeTab === 'ignoaps' ? '#1e293b' : 'var(--text-main)', border: '2px solid var(--border)' }}
                onClick={() => setActiveSchemeTab('ignoaps')}
              >
                Pension
              </button>
              <button 
                className={`acc-btn ${activeSchemeTab === 'pmvvy' ? 'active' : ''}`}
                style={{ backgroundColor: activeSchemeTab === 'pmvvy' ? 'var(--accent)' : 'transparent', color: activeSchemeTab === 'pmvvy' ? '#1e293b' : 'var(--text-main)', border: '2px solid var(--border)' }}
                onClick={() => setActiveSchemeTab('pmvvy')}
              >
                LIC Savings
              </button>
              <button 
                className={`acc-btn ${activeSchemeTab === 'pmjay' ? 'active' : ''}`}
                style={{ backgroundColor: activeSchemeTab === 'pmjay' ? 'var(--accent)' : 'transparent', color: activeSchemeTab === 'pmjay' ? '#1e293b' : 'var(--text-main)', border: '2px solid var(--border)' }}
                onClick={() => setActiveSchemeTab('pmjay')}
              >
                Golden Card
              </button>
            </div>

            {/* Selected Scheme overview */}
            {currentScheme && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>
                  {currentScheme.simplified_name}
                </h3>
                <p style={{ fontSize: '17px', color: 'var(--text-muted)' }}>
                  {currentScheme.name}
                </p>

                {/* Interactive documents checklist */}
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}>
                    <CheckSquare size={20} />
                    <span>{getUIText('checkDocuments', selectedLanguage)}</span>
                  </h4>
                  <div className="doc-checklist">
                    {currentScheme.documents.map((doc, idx) => (
                      <label key={idx} className="checklist-item">
                        <input type="checkbox" className="checklist-checkbox" />
                        <div>
                          <strong>{doc.name}</strong> - <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{doc.purpose}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', color: 'var(--text-muted)' }}>
                  <p>📞 Helpline: <strong>{currentScheme.contact.helpline}</strong></p>
                  <p>🏢 Office: {currentScheme.contact.office}</p>
                </div>

                <button 
                  className="acc-btn"
                  style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', justifyContent: 'center' }}
                  onClick={() => handleSendQuery(`Explain ${currentScheme.simplified_name}`)}
                >
                  {getUIText('showSteps', selectedLanguage)}
                </button>
              </div>
            )}
          </section>

          {/* Voice Command & Click Suggestions */}
          <section className="card" aria-labelledby="suggestions-title">
            <h2 id="suggestions-title" className="card-title">
              <HelpCircle size={28} />
              <span>{getUIText('commonQuestions', selectedLanguage)}</span>
            </h2>
            <div className="suggestions-list" role="list">
              {SUGGESTIONS.map((sug, idx) => (
                <button 
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSendQuery(sug.text)}
                  role="listitem"
                >
                  💡 {sug.label} <span style={{ fontSize: '14px', fontStyle: 'italic', display: 'block', color: 'var(--text-muted)', marginTop: '4px' }}>"{sug.text}"</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Call Support Banner */}
      <footer style={{ marginTop: '48px' }}>
        <div className="support-banner">
          <div className="support-details">
            <p className="support-title">{getUIText('supportTitle', selectedLanguage)}</p>
            <p style={{ fontSize: '17px' }}>{getUIText('supportText', selectedLanguage)}</p>
          </div>
          <button 
            className="call-btn"
            onClick={() => alert("Calling senior e-governance support helpline at 1800-200-3333... Connecting you now. Please stay on line.")}
            aria-label="Call senior help desk agent now"
          >
            <Phone size={24} />
            <span>{getUIText('callButton', selectedLanguage)}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
