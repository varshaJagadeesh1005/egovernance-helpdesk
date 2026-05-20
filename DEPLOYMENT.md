# Deployment Guide

This project contains a full-stack React + Flask application. The deployment setup uses Docker so the frontend build is served from the Flask backend and the API is available on the same origin.

## Build and Run with Docker

1. Open a terminal in the project root (`d:\E-Governance`).
2. Build the container:

```bash
docker compose build
```

3. Start the service:

```bash
docker compose up -d
```

4. Open the app in your browser:

```
http://localhost:8000
```

## Cloud deployment

This repository now includes an automated GitHub Actions workflow that builds your Docker image and publishes it to GitHub Container Registry (GHCR) when you push to `main`.

### Publish the container image

1. Push your repository to GitHub.
2. Verify the workflow file exists at `.github/workflows/docker-publish.yml`.
3. After the workflow runs, your image will be available at:

```text
ghcr.io/<owner>/<repository>:latest
```

### Deploy to a cloud provider

Use the published image URI in any container hosting service.

#### AWS App Runner

- Create an App Runner service.
- Select GitHub Container Registry as the source.
- Use `ghcr.io/<owner>/<repository>:latest`.
- Set the container port to `8000`.

#### Google Cloud Run

- Enable Cloud Run in your GCP project.
- Create a new service from an existing container image.
- Use `ghcr.io/<owner>/<repository>:latest`.
- Set the service port to `8000`.

#### Azure App Service for Containers

- Create a Web App for Containers.
- Choose Docker Container and set the image URI to `ghcr.io/<owner>/<repository>:latest`.
- Configure port `8000`.

### Optional: Docker Hub

If you want Docker Hub instead of GHCR, create a Docker Hub repository and push the image there using your own Docker Hub credentials.

## What the Docker setup does

- `Dockerfile` builds the frontend with Node and Vite
- It installs Python dependencies from `backend/requirements.txt`
- It copies the generated frontend static files to `backend/frontend_dist`
- `backend/app.py` serves the frontend static files and handles `/api/chat`

## Notes

- If you change frontend code, rebuild with `docker compose build`.
- If you want to run locally without Docker, build the frontend manually and start the backend:

```bash
cd frontend
npm install
npm run build
cd ../backend
python app.py
```
