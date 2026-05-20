from flask import Flask, request, Response, send_from_directory
from flask_cors import CORS
from utils.language_detector import detect_language
from utils.translator import translate_text
from utils.speech_helper import sanitize_for_speech
import traceback
import json
import os

STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'frontend_dist')

try:
    from rag_service import query_helpdesk
except ImportError:
    print("Warning: rag_service could not be imported.")
    def query_helpdesk(query: str, preferred_lang: str = None):
        return {
            "response": "I am here to help you. How can I assist?",
            "intent": "OTHER",
            "confidence": 1.0,
            "language": "english",
            "requires_clarification": "NO",
            "clarification_question": "",
            "scheme_id": None
        }

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
CORS(app)

@app.route('/api/status', methods=['GET'])
def read_root():
    content = json.dumps({"message": "Welcome to the E-Governance Helpdesk API for Senior Citizens"}, ensure_ascii=False)
    return Response(content, mimetype='application/json'), 200

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.get_json()
        if not data:
            return Response(json.dumps({"error": "No JSON payload provided"}), status=400, mimetype='application/json')
            
        user_query = data.get("query", "")
        frontend_language = data.get("language", "en-IN")
        
        LANGUAGE_CODE_MAP = {
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
        FRONTEND_LANG_TO_NAME = {
            'en-IN': 'english',
            'hi-IN': 'hindi',
            'kn-IN': 'kannada',
            'ta-IN': 'tamil',
            'te-IN': 'telugu',
            'mr-IN': 'marathi'
        }

        frontend_language = LANGUAGE_CODE_MAP.get(str(frontend_language).strip().lower(), 'en-IN')
        
        # 1. Language Detection
        detected_lang = detect_language(user_query)
        
        # Always prefer an explicit chosen frontend language if it is set non-English.
        if frontend_language != 'en-IN':
            best_code = frontend_language
        elif detected_lang != 'en-IN':
            best_code = detected_lang
        else:
            best_code = 'en-IN'

        rag_lang_input = FRONTEND_LANG_TO_NAME.get(best_code, 'english')

        # Translate query to English if necessary for backend intent processing
        english_query = user_query
        if best_code != 'en-IN':
            english_query = translate_text(user_query, 'en-IN')

        # 2. Get AI Response
        result = query_helpdesk(english_query, preferred_lang=rag_lang_input)

        raw_response = result.get("response", "")
        final_response = raw_response
        if best_code != 'en-IN' and result.get("language", "").lower() in ["english", "en", ""]:
            final_response = translate_text(raw_response, best_code)

        # Sanitize for Text-to-Speech
        spoken_response = sanitize_for_speech(final_response)
        
        response_dict = {
            "response": final_response,
            "spoken_response": spoken_response,
            "intent": result.get("intent", "OTHER"),
            "confidence": result.get("confidence", 0.0),
            "language": best_code,
            "requires_clarification": result.get("requires_clarification", "NO"),
            "clarification_question": result.get("clarification_question", "")
        }
        
        return Response(json.dumps(response_dict, ensure_ascii=False), mimetype='application/json'), 200

    except Exception as e:
        traceback.print_exc()
        return Response(json.dumps({"error": str(e)}), status=500, mimetype='application/json')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != '' and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    return send_from_directory(STATIC_FOLDER, 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
