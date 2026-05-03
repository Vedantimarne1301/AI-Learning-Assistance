#  AI Learning Assistant

An AI-powered full-stack web application that generates structured educational content for any topic and grade level. Enter a topic, get a complete lesson with a summary, key points, a curated YouTube video, and an interactive quiz with detailed AI feedback.



##  Features

| Feature | Description |
|---|---|
| **Lesson Generation** | AI-generated summary, key points, and quiz for any topic |
| **Voice Search** | Speak your topic using the browser's Web Speech API |
| **Simplified Mode** | Toggle between normal and beginner-friendly explanation |
| **Interactive Quiz** | 3-question quiz with option selection and instant feedback |
| **AI Quiz Feedback** | Per-question explanation of mistakes, correct concept, and topics to review |
| **Results Screen** | Full score breakdown with per-question review |
| **Regenerate** | Re-generate any lesson with one click |
| **Recent Searches** | Last 3 topics saved in localStorage for quick re-access |
| **Multi-page Flow** | Home → Lesson → Quiz with React Router |


---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Custom CSS — Lora + Karla fonts, warm notebook aesthetic |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| Input Validation | express-validator |
| Logging | Morgan |
| AI Model | Groq API — llama-3.1-8b-instant |
| Voice Input | Web Speech API (browser-native) |

---

##  Setup Instructions

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- A [Groq API key](https://console.groq.com)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/AI-Learning-Assistant.git
cd AI-Learning-Assistant
```

---

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
GROQ_API_KEY=your_groq_api_key_here
PORT=5000

Start the server:

```bash
node server.js
```

Backend runs at `http://localhost:5000`

---

### Step 3 — Frontend setup

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

Open your browser and go to `http://localhost:5173`

---

### Step 4 — Getting your API keys

#### Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys → Create API Key**
4. Copy the key into `backend/.env` as `GROQ_API_KEY`

---

## 🔌 API Reference

### `POST /api/learn`
Generates a full lesson for a topic and grade.

**Request body:**
```json
{
  "topic": "Photosynthesis",
  "grade": 6
}
```

**Response:**
```json
{
  "topic": "Photosynthesis",
  "grade": 6,
  "summary": "Photosynthesis is the process...",
  "simplifiedSummary": "Here's a simple way to think about it: ...",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "quiz": [
    {
      "question": "What does a plant need for photosynthesis?",
      "options": ["Water", "Sand", "Salt", "Oil"],
      "correctAnswer": "Water"
    }
  ]
}
```

---

### `POST /api/feedback`
Generates AI explanation for a wrong quiz answer.

**Request body:**
```json
{
  "question": "What does a plant need for photosynthesis?",
  "userAnswer": "Sand",
  "correctAnswer": "Water",
  "topic": "Photosynthesis",
  "keyPoints": ["Plants use sunlight...", "..."]
}
```

**Response:**
```json
{
  "mistake": "Sand has no role in photosynthesis...",
  "explanation": "Plants absorb water through their roots...",
  "pointsToCover": ["Plant biology", "Chlorophyll", "Water cycle"]
}
```

---

##  Approach Explanation

### How a lesson is generated

1. User enters a **topic** and **grade level** on the home page, either by typing or using voice input
2. Frontend sends `POST /api/learn` to the backend
3. Backend crafts a **strictly structured prompt** instructing Groq's LLM to respond only in JSON, with a summary, key points array, and 3 quiz questions each with 4 options
4. The **processing layer** (`processingService.js`) validates the returned JSON, strips any markdown formatting the model may have added, and falls back to regex extraction if the response is partially malformed
5. A **simplified summary** is generated via rule-based text transformation — substituting complex words with simpler alternatives and adding a grade-appropriate friendly prefix
6. The full structured object is returned to the frontend

### How quiz feedback works

1. When a user picks a **wrong answer**, the frontend immediately sends `POST /api/feedback` with the question, both answers, the topic, and the lesson's key points as context
2. Groq generates a targeted 3-part response: what specifically was wrong, a clear re-explanation of the correct concept, and a list of topics the student should review
3. Feedback is displayed inline below the question and again on the final results screen for every missed question


### Voice Search

Uses the browser's built-in **Web Speech API** — no external service or additional API key required. A microphone button sits next to the topic input. Clicking it starts listening; the recognized transcript populates the input field automatically. A graceful error message is shown in browsers that do not support the API (Firefox, Safari).

### Frontend routing

React Router v6 manages three routes:
/        → HomePage   (topic input, grade selection, voice search, recent history)
/lesson  → LessonPage (summary, key points, YouTube video, quiz CTA)
/quiz    → QuizPage   (interactive quiz, per-question feedback, results screen

All lesson data is held in `App.jsx` state and passed as props, keeping the data flow predictable without a global state library.

---

##  Assumptions Made

| Area | Assumption |
|---|---|
| **Grade range** | Grades 1–12 are supported. The LLM prompt uses the grade number to calibrate vocabulary and explanation depth. |
| **Language** | All generated content is in English. |
| **Quiz format** | Always exactly 3 questions, each with exactly 4 options and one correct answer. The processing layer enforces and validates this structure. |
| **AI response format** | The LLM is prompted to return only JSON. The processing layer handles cases where it wraps the response in markdown code fences or includes extra text. |
| **Simplified summary** | The simplified mode uses rule-based word substitution rather than a second LLM call — intentionally lightweight to avoid doubling API usage and latency. |
| **Voice search support** | Web Speech API works in Chromium-based browsers only (Chrome, Edge). Other browsers receive a clear error message rather than a broken experience. |
| **Session persistence** | Lesson and quiz data live in React component state. Refreshing the `/quiz` or `/lesson` page directly will redirect to home, as state is not persisted to localStorage or a database. |
| **Recent searches** | Only the topic and grade of the last 3 searches are stored in localStorage — no lesson content is cached locally. |
| **API key security** | The Groq API key is stored server-side in `.env` and never sent to the frontend. |
| **Model choice** | `llama-3.1-8b-instant` on Groq is used for both lesson generation and quiz feedback. It is fast enough for a responsive UX and reliable enough for structured JSON output at educational complexity levels. |

---

##  Running Both Servers

You need two terminals open simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
# Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

##  Environment Variables

| Variable | Where to get it | Required |
|---|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Yes |
| `PORT` | Set to `5000` or any open port | No (defaults to 5000) |

Never commit your `.env` file. It is already listed in `.gitignore`.

---

