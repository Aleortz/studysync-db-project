# StudySync: Academic Collective Memory

Full-stack database project implementing a NoSQL Document Database (Firebase Firestore), a Python Flask REST API, and a modern React Vite GUI.

## 🚀 Technologies Used
* **Database:** Firebase Firestore (NoSQL)
* **Backend:** Python, Flask, Firebase Admin SDK
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion

## ⚙️ Setup Instructions

### 1. Firebase Project Setup
Before running the backend, you need to set up a Firebase project and obtain your service account credentials.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project** to create a new project.
2. In the left sidebar, navigate to **Build > Firestore Database** and click **Create database**. (You can choose "Start in Test mode" for local development).
3. Go to **Project Settings** (the gear icon in the top left) and navigate to the **Service Accounts** tab.
4. Select **Python** as the platform and click the **Generate new private key** button.
5. Download the file, rename it exactly to `serviceAccountKey.json`, and place it inside the root of your backend folder.

### 2. Backend Setup
Navigate to the backend directory:
\`\`\`bash
cd mi-proyecto-backend
\`\`\`
Create and activate the virtual environment:
\`\`\`bash
python -m venv .venv
.\.venv\Scripts\activate  # On Windows
\`\`\`
Install dependencies:
\`\`\`bash
pip install flask firebase-admin flask-cors
\`\`\`
*Note: Ensure your `serviceAccountKey.json` from the previous step is in this directory.*

Run the API:
\`\`\`bash
python app.py
\`\`\`

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
\`\`\`bash
cd studysync
\`\`\`
Install dependencies:
\`\`\`bash
npm install
npm install lucide-react motion
\`\`\`
Create a `.env` file in the root of the `studysync` folder:
\`\`\`text
VITE_API_URL=http://127.0.0.1:5000
\`\`\`
Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## 👥 Authors
* Christopher Ortiz
* Demian Viteri
