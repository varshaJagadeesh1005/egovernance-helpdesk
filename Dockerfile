# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./backend/requirements.txt
# Fail fast if the requirements file was not copied correctly
RUN test -f ./backend/requirements.txt \
  && ls -la ./backend/requirements.txt \
  && pip install --no-cache-dir -r ./backend/requirements.txt


COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend_dist

WORKDIR /app/backend
EXPOSE 8000
CMD ["python", "app.py"]
