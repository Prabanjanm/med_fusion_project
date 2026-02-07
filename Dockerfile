# ==========================================
# Stage 1: Build Frontend (Node.js)
# ==========================================
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm install

# Copy source code
COPY frontend/ ./

# Build the frontend (Output: /app/frontend/dist)
RUN npm run build

# ==========================================
# Stage 2: Setup Backend (Python)
# ==========================================
FROM python:3.11-slim as backend

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (optional but recommended)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend

# ==========================================
# Stage 3: Merge & Finalize
# ==========================================
# Copy the built frontend artifacts from Stage 1 into the backend static folder
# ensuring the directory structure matches what FastAPI expects
COPY --from=frontend-builder /app/frontend/dist /app/backend/app/static

# Switch to non-root user for security (optional but good practice)
# RUN useradd -m appuser && chown -R appuser /app
# USER appuser

# Set working directory to where main.py is importable
WORKDIR /app/backend

# Expose port (Render sets $PORT env var automatically)
ENV PORT=10000
EXPOSE $PORT

# Run the application
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
