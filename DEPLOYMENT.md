# 🚀 Foolproof Google Cloud Deployment Guide

This guide gives you the **exact copy-paste terminal commands** you need to deploy JasmineIQ to Google Cloud for your hackathon.

---

## 🛑 Phase 1: Google Cloud Initial Setup

Before doing anything, you need to tell your computer which Google Cloud account to use and enable the necessary services.

**1. Log in to your Google Account**
Open your terminal (PowerShell or VS Code terminal) and run:
```bash
gcloud auth login
```
*(This will open a web browser. Log in with your Google account and click Allow.)*

**2. Set up Application Default Credentials**
This allows our Python backend to access BigQuery securely.
```bash
gcloud auth application-default login
```
*(This will open the browser again. Log in and allow.)*

**3. Set your Google Cloud Project**
Replace `YOUR_PROJECT_ID` with the actual project ID from your Google Cloud Console.
```bash
gcloud config set project YOUR_PROJECT_ID
```

**4. Enable Required APIs**
Run this command to turn on Cloud Run, Artifact Registry, and Cloud Build in your project:
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com bigquery.googleapis.com
```

---

## 📊 Phase 2: Upload Data to BigQuery

We need to push your local CSV file into Google BigQuery so the ML model can read it from the cloud.

1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Make sure you have installed the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the setup script. This script automatically creates the `jasmineiq` dataset and uploads the CSV:
   ```bash
   python setup_bq.py
   ```
   *(Wait until it prints "Successfully loaded rows into...". Your data is now in the cloud!)*
4. Train the ML model offline so it's ready for deployment:
   ```bash
   python training/train_model.py
   ```
   *(Wait until it prints "Model successfully saved". This creates your `.pkl` file.)*

---

## 🌐 Phase 3: Deploy the Backend to Cloud Run

We will deploy the FastAPI python server first.

1. Make sure you are still inside the `backend` folder in your terminal.
2. Run the deployment command. Replace `YOUR_GEMINI_API_KEY` and `YOUR_OPENWEATHER_API_KEY` with your actual keys.
   ```bash
   gcloud run deploy jasmineiq-backend --source . --set-env-vars="GEMINI_API_KEY=YOUR_GEMINI_API_KEY,OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY" --allow-unauthenticated --region=us-central1 --memory=1Gi
   ```
3. **Wait for it to finish.** When it is done, the terminal will print a **Service URL** that looks like this:
   `https://jasmineiq-backend-xxxxx.a.run.app`
4. **COPY THAT URL.** You need it for the next step.

---

## 🖥️ Phase 4: Deploy the Frontend to Cloud Run

Now we deploy the Next.js UI, but first, we have to tell it where the backend is.

1. Open the file `frontend/src/lib/api.ts` in your code editor.
2. Find the line that says `const API_BASE = "http://localhost:8000/api"`.
3. Change it to use the URL you copied in Phase 3. 
   *(Make sure to add `/api` at the end!)*
   **Example:**
   `const API_BASE = "https://jasmineiq-backend-xxxxx.a.run.app/api"`
4. Save the file.
5. In your terminal, navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
6. Run the deployment command for the frontend:
   ```bash
   gcloud run deploy jasmineiq-frontend --source . --allow-unauthenticated --region=us-central1
   ```
7. **Wait for it to finish.** It will give you a final URL. 

### 🎉 Click that final URL, and your JasmineIQ platform is live on the internet!
