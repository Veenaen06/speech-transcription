# 🎙️ VoxNote – Real-Time Multilingual Speech-to-Text

VoxNote is a web-based speech-to-text application designed to convert spoken language into text in real time. It provides a simple interface for recording speech, viewing transcriptions, editing the generated text, and managing saved transcripts.

The application uses React for the frontend, Django REST Framework for the backend, PostgreSQL for data storage, and Google's Gemini Live API for real-time speech processing.

## 🌐 Live Demo

https://speech-transcription.vercel.app/


## ✨ Features

- 🎤 **Real-Time Speech Transcription:** Convert speech into text through microphone input.
- 🌍 **Multilingual Speech:** Designed for speech transcription across multiple languages.
- 📝 **Transcript Editor:** Review and edit generated transcription text.
- 💾 **Save Transcripts:** Save transcripts with a title and language information.
- 📚 **Transcript History:** Retrieve and view previously saved transcripts.
- ✏️ **Edit Transcripts:** Update saved transcription records.
- 🗑️ **Delete Transcripts:** Remove transcripts from the database.
- 🔎 **Search History:** Find saved transcripts using the application's search functionality.
- ⚡ **REST API:** Communicate with the backend through Django REST Framework.
- ☁️ **Cloud Deployment:** Frontend, backend, and database are hosted using cloud services.

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- Vite
- CSS
- Lucide React

### Backend
- Python
- Django
- Django REST Framework
- Google GenAI SDK
- Gunicorn

### Database
- PostgreSQL
- Neon PostgreSQL

### AI Integration
- Google Gemini Live API

### Deployment
- Vercel – Frontend hosting
- Render – Backend hosting
- Neon – PostgreSQL database hosting
- GitHub – Version control and source code management

## 🏗️ Project Architecture

The application follows a client-server architecture.

1. The user interacts with the React frontend.
2. The frontend sends API requests to the Django backend.
3. Django communicates with PostgreSQL to create, retrieve, update, and delete transcription records.
4. The backend generates a temporary Gemini session token for the live transcription connection.
5. The frontend uses the temporary token to establish a connection to Gemini Live and process microphone audio.
6. The generated transcription is displayed in the editor.
7. The user can save the transcript to PostgreSQL through the backend API.

The Gemini API key is stored on the backend and should never be exposed in frontend code.

## 📂 Project Structure

```text
Live_transcript/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── transcriptions/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── apps.py
│   │
│   ├── .gitignore
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Recorder.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the project locally:

- Python 3.10 or later, compatible with your installed Django and Google GenAI dependencies
- Node.js and npm
- PostgreSQL database or a Neon PostgreSQL account
- Google Gemini API key with access to the required Live API model
- Git

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Veenaen06/speech-transcription.git
cd speech-transcription
```



### 2. Set Up the Django Backend

Open a terminal and navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

```env
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

GEMINI_API_KEY=your_gemini_api_key
```

Replace the example values with your own credentials.

**Security:** Never commit your `.env` file, database password, Django secret key, or Gemini API key to GitHub.

For local development, `DEBUG=True` is acceptable. Set `DEBUG=False` in production.

### 4. Configure the PostgreSQL Database

Create a PostgreSQL database locally or configure a Neon PostgreSQL database.

Update the database environment variables in `backend/.env` with the correct connection details.

For Neon, use the database hostname, username, password, and database name provided by the Neon Console.

Apply the Django migrations:

```bash
python manage.py migrate
```

Check the Django configuration:

```bash
python manage.py check
```

### 5. Configure CORS

In `backend/config/settings.py`, allow the local frontend origin:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

Ensure that `corsheaders.middleware.CorsMiddleware` appears before `django.middleware.common.CommonMiddleware` in the middleware list.

When deploying, add the actual production frontend origin:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://speech-transcription.vercel.app",
]
```

### 6. Start the Django Backend

From the `backend` directory, run:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

The transcription API is available at:

```text
http://127.0.0.1:8000/api/transcriptions/
```

### 7. Set Up the React Frontend

Open a second terminal and navigate to the frontend:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

### 8. Configure the Frontend API URL

Create a `.env` file inside `frontend` for local development:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 9. Start the React Frontend

Run:

```bash
npm run dev
```

Vite will display a local development URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser.

Ensure both the Django backend and React frontend are running.

## 🔌 API Endpoints

The backend provides REST API endpoints for managing transcription records.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transcriptions/` | Retrieve saved transcripts |
| POST | `/api/transcriptions/` | Create a transcript |
| GET | `/api/transcriptions/{id}/` | Retrieve one transcript |
| PATCH | `/api/transcriptions/{id}/` | Update a transcript |
| PUT | `/api/transcriptions/{id}/` | Replace a transcript |
| DELETE | `/api/transcriptions/{id}/` | Delete a transcript |
| POST | `/api/live-token/` | Request a temporary Gemini session token |

### Example: Create a Transcript

```json
{
  "title": "Meeting Notes",
  "text": "This is an example transcription.",
  "language": "English"
}
```

The actual response includes the transcript ID and timestamps.

The live-token endpoint expects a POST request. Opening it directly in a browser may return `405 Method Not Allowed` because a GET request is not supported.

## ☁️ Deployment

### Frontend – Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `frontend`.
3. Select Vite as the framework preset.
4. Configure the `VITE_API_URL` environment variable.
5. Deploy the project.

Live URL:

https://speech-transcription.vercel.app/

### Backend – Render

1. Create a Render Web Service connected to the GitHub repository.
2. Set the root directory to `backend`.
3. Configure the Python build command:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the start command:

   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```

5. Configure the required environment variables in Render.
6. Set `DEBUG=False`.
7. Configure `ALLOWED_HOSTS` with the actual Render hostname.
8. Apply database migrations during deployment.
9. Deploy the service.

Live backend:

https://speech-transcription-ktoc.onrender.com/

### Database – Neon

1. Create a PostgreSQL project in Neon.
2. Copy the connection details.
3. Configure the database environment variables in Render.
4. Apply Django migrations.
5. Verify that transcription records can be created and retrieved.


## 🚧 Future Enhancements

- User authentication and individual transcript libraries
- Download transcripts as TXT, PDF, or DOCX
- Improved language selection and multilingual handling
- Transcript timestamps and speaker identification
- Audio file upload and transcription
- Transcript export and sharing
- Improved error handling and connection recovery
- Automated tests and API documentation

## 👩‍💻 Author

VEENA E N

GitHub: https://github.com/Veenaen06

