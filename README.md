# E-Governance Helpdesk

E-Governance Helpdesk is a full-stack multilingual citizen support application built for senior citizens and digitally underserved users. It combines a React + Vite frontend with a Python Flask backend to provide conversational guidance for Indian government welfare schemes, voice-enabled interactions, and localized support in multiple Indian languages.

## 🌟 Key Features

- Multilingual support for:
  - English
  - Hindi
  - Kannada
  - Tamil
  - Telugu
  - Marathi
- Chat-based helpdesk with intelligent scheme guidance
- Voice input and text-to-speech output using browser speech APIs
- Automatic language detection and translation flow
- Backend API for natural query handling and intent processing
- Docker-ready production deployment
- GitHub Actions support for container builds and publishing

## 📁 Project Structure

- `backend/`
  - `app.py` — Flask API server and frontend static asset handler
  - `rag_service.py` — Intent parsing and helpdesk response logic
  - `requirements.txt` — Python dependencies
- `frontend/`
  - `src/` — React application source
  - `script.js` / `voice.js` — additional frontend utilities
  - `package.json` — client dependencies and scripts
- `Dockerfile` — multi-stage container build
- `docker-compose.yml` — local Docker compose setup
- `DEPLOYMENT.md` — deployment guide and cloud instructions

## 🧠 Tech Stack

- Frontend: React 19, Vite, Axios
- Backend: Python, Flask, Flask-CORS
- Translation: `deep-translator`
- Language detection: `langdetect`
- Speech support: Web Speech API
- Deployment: Docker, GitHub Actions

## 🚀 Run Locally

### Backend
```bash
cd backend
python app.py

give me proper content based on this for readme file in github
