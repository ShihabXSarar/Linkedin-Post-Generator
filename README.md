# LinkedIn Post Generator 🚀

An AI-powered LinkedIn content strategy assistant built with **FastAPI**, **LangChain**, and **Google Gemini (gemini-2.5-flash)**. This application generates engaging, professional, and well-structured LinkedIn posts based on user-provided topics.

## Features

- **AI Post Generation**: Creates structured LinkedIn posts with a compelling hook, actionable insights, a call-to-action, and relevant hashtags.
- **FastAPI Backend**: Fast and lightweight API server handling requests and serving static assets.
- **Clean Responsive UI**: Simple and modern frontend for writing topics, selecting languages, generating posts, and copying them with one click.
- **Docker Support**: Containerized using Docker and Docker Compose for easy and consistent setup.

---

## Tech Stack

- **Backend**: FastAPI, Uvicorn
- **AI Orchestration**: LangChain, langchain-google-genai
- **LLM Model**: Google Gemini 2.5 Flash
- **Frontend**: Vanilla HTML5, CSS3, Javascript
- **Containerization**: Docker, Docker Compose

---

## Getting Started

### Prerequisites

- Python 3.10+
- Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/apikey).

### Setup and Running Locally

1. **Clone the Repository** (or navigate to the project directory):
   ```bash
   cd "Linkedin Post Generator"
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

5. **Run the Application**:
   ```bash
   python app.py
   ```
   The application will start at `http://localhost:8000`.

---

## Running with Docker

You can also run the application without installing Python dependencies locally using Docker and Docker Compose.

1. Ensure Docker Desktop is installed and running.
2. Build and run the containers:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8000` in your browser.

---

## License

This project is licensed under the MIT License.
