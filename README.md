# 🛡️ ScamIntel Honeypot

An AI-powered backend system that detects scam attempts, engages scammers in dynamic multi-turn conversations, extracts structured intelligence, and reports findings via a final callback mechanism.

Deployed on **Render**.

---

# 🚀 Live API

```
POST https://honeypot-fr53.onrender.com
```

Backend-only system.
Testable using **Postman / cURL / any HTTP client**.

---

# 🎯 Objective

Instead of immediately blocking scammers, this system:

1. Detects scam intent (Hybrid AI + Heuristics)
2. Engages scammer using AI persona
3. Extracts actionable intelligence
4. Reports structured results via callback
5. Stores full conversation in MongoDB

This simulates a real-world **AI honeypot intelligence trap**.

---

# 🧠 Core Capabilities

* ✅ Hybrid Scam Detection (Regex + AI scoring)
* ✅ Multi-turn AI engagement
* ✅ Human-like dynamic responses
* ✅ Intelligence extraction from conversation
* ✅ Background async extraction worker
* ✅ Final callback API reporting
* ✅ Timeout-protected AI calls
* ✅ Persistent conversation memory

---

# 🏗️ Project Structure

```
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── openrouter.js
│   │
│   ├── constants/
│   │   └── models.js
│   │
│   ├── controllers/
│   │   └── honeypot.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/
│   │   └── conversation.model.js
│   │
│   ├── prompts/
│   │   ├── agentPersona.prompt.js
│   │   ├── extraction.prompt.js
│   │   └── scamDetection.prompt.js
│   │
│   ├── routes/
│   │   └── honeypot.routes.js
│   │
│   ├── services/
│   │   ├── agent.service.js
│   │   ├── extarction.service.js
│   │   ├── openrouter.service.js
│   │   └── scamDetection.service.js
│   │
│   ├── utils/
│   │   ├── jsonCleaner.js
│   │   ├── metrics.util.js
│   │   └── responseFormatter.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---
### env file
```
PORT=4000
MONGO_URI=mongodb_url
OPENROUTER_API_KEY=xxxxx
API_KEY=test_api_key

```

---


# ⚙️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### AI Layer

* OpenRouter LLM API
* Prompt engineering
* AI persona modeling

### Infrastructure

* Render (Deployment)
* Axios (External API callback)
* Async background processing

---

# 🔍 Scam Detection System

Hybrid model combining:

### 1️⃣ Heuristic Detection (Fast Regex)

Detects:

* UPI IDs
* URLs
* Phone numbers
* Keywords: verify, blocked, urgent, click, OTP, pay, etc.

### 2️⃣ AI Detection (Confidence-based)

AI returns:

```
{
  scam: boolean,
  confidence: 0.0 – 1.0
}
```

### 🎯 Final Risk Score

```
Risk = (Heuristic × 0.7) + (AI Confidence × 0.3)
```

If ≥ 0.6 → conversation marked as scam.

This ensures:

* Low latency
* Cost control
* High detection reliability

---

# 🤖 AI Persona Behavior

When scam is detected, AI:

* Does NOT reveal detection
* Acts confused / concerned
* Asks follow-up questions
* Extracts more intelligence
* Adapts based on conversation history
* Handles multi-turn context

---

# 📦 Intelligence Extracted

System extracts structured data:

* 🏦 Bank Accounts
* 💳 UPI IDs
* 🔗 Phishing URLs
* 📞 Phone Numbers
* ⚠ Suspicious Keywords
* 📝 AI Agent Notes (behavioral analysis)

---

# 🧪 Example: Extracted Intelligence (Real Output)

```
Final Callback sent for session: 3d75b6a6-17f5-415f-907a-f9c42a30b724

{
  sessionId: '3d75b6a6-17f5-415f-907a-f9c42a30b724',
  scamDetected: true,
  totalMessagesExchanged: 2,
  extractedIntelligence: {
    bankAccounts: [],
    upiIds: [],
    phishingLinks: [
      'http://amaz0n-deals.fake-site.com/claim?id=12345'
    ],
    phoneNumbers: [],
    suspiciousKeywords: [
      'claim',
      'quickly',
      'immediately'
    ]
  },
  agentNotes: 'User is being offered a deal that seems too good to be true, and is being asked to send money quickly. The link is a phishing link and the offer expires in 10 minutes, which is a common tactic to create urgency.'
}
```

---

# ⏱ Latency Optimizations

| Component         | Timeout          |
| ----------------- | ---------------- |
| Scam Detection AI | ~1200ms          |
| AI Agent Response | ~5000ms          |
| Extraction        | Background async |

Response is sent immediately.
Extraction & callback run non-blocking.

---

# 🧪 How To Test (Postman)

## Endpoint

```
POST /
```

(or your configured route, e.g., /api/honeypot)

---

## Request Format

```json
{
  "sessionId": "test-session-001",
  "message": {
    "sender": "scammer",
    "text": "Click http://amaz0n-deals.fake-site.com/claim?id=12345 to claim your prize immediately!",
    "timestamp": 1769776085003
  }
}
```

---

## Example Response

```json
{
  "status": "success",
  "reply": "Sir, I opened the link but I'm confused. It says the offer expires soon. What exactly do I need to do?"
}
```

---

# 🗄️ Conversation Model

Each conversation stores:

```
conversationId
messages[]
scamDetected (boolean)
extractedData {
    bankAccounts[]
    upiIds[]
    phishingLinks[]
    phoneNumbers[]
    suspiciousKeywords[]
    agentNotes
}
finalCallbackSent (boolean)
```

---

# 🔄 System Flow

```mermaid
flowchart TD
    Start([Incoming Message]) --> Heuristic[Heuristic Detection]
    Heuristic --> AIDetection[AI Detection<br/><i>Timeout Protected</i>]
    
    AIDetection --> IsScam{Is Scam?}
    
    IsScam -- No --> End([End Process])
    
    IsScam -- Yes --> Persona[AI Persona Response]
    
    subgraph Action_Phase[Automated&nbsp;Response&nbsp;&&nbsp;Logging]
        direction TB
        Reply[Send Immediate Reply]
        Extract[Background Extraction]
        DB[DB Update]
    end
    
    Persona --> Action_Phase
    Action_Phase --> Callback[Final Callback API]
    Callback --> End
```

---

# 🔮 Future Improvements

* Redis queue for extraction jobs
* Web dashboard for monitoring
* Behavioral scam profiling
* RAG-based scam pattern memory
* Rate limiting middleware
* Threat intelligence API integration

---

# 👨‍💻 Author

Harsh Tripathi

GitHub: [https://github.com/ImaginationGod/Honeypot](https://github.com/ImaginationGod/Honeypot)

---
