# StudySync: Academic Collective Memory

Full-stack database project implementing a NoSQL Document Database (Firebase Firestore), a Python Flask REST API, and a modern React Vite GUI.

## Technologies Used
* **Database:** Firebase Firestore (NoSQL)
* **Backend:** Python, Flask, Firebase Admin SDK
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion

## ⚙️ Setup Instructions

### 1. Backend Setup
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
*Note: You must place your own `serviceAccountKey.json` from Firebase in the root of the backend folder.*

Run the API:
\`\`\`bash
python app.py
\`\`\`

### 2. Frontend Setup
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