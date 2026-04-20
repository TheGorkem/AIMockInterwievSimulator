# InterviewPro - AI-Powered Interview Mastery

InterviewPro is a comprehensive AI-driven interview preparation platform that helps developers and professionals practice job interviews with realistic AI interviewers. Experience adaptive questioning, instant feedback, and personalized coaching to ace your next technical interview.

## Features

- 🎥 **Adaptive AI Interviewers**: AI adjusts questions based on your skill level and responses
- 🧠 **Instant Scoring & Feedback**: Real-time analysis of your answers with detailed feedback
- 🎯 **Multiple Interview Types**: Technical, behavioral, and mixed interview modes
- 📊 **Performance Tracking**: Comprehensive analytics and progress monitoring
- 🎮 **Interactive Practice**: Voice interaction and hint systems
- 🎤 **Smart Follow-ups**: AI asks relevant follow-up questions based on your responses
- 🌙 **Dark/Light Theme**: Modern UI with theme switching
- 🌐 **Multi-language Support**: Available in multiple languages

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Python FastAPI
- **AI Integration**: OpenAI/Claude API
- **Deployment**: Vercel (Frontend), Railway/Heroku (Backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Python 3.8+ (for backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AIMockInterwievSimulator.git
cd AIMockInterwievSimulator/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Backend Setup

1. Navigate to backend directory:
```bash
cd ../backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
python main.py
```

## Project Structure

```
frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── interview/
│       └── page.tsx
├── components/
│   ├── language-toggle.tsx
│   ├── share-results.tsx
│   ├── theme-toggle.tsx
│   └── user-stats.tsx
├── lib/
│   ├── api.ts
│   ├── language-context.tsx
│   └── theme-context.tsx
└── public/

backend/
├── main.py
├── routers/
│   ├── interview.py
│   └── __init__.py
├── services/
│   ├── ai_service.py
│   ├── session_service.py
│   └── __init__.py
└── requirements.txt
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- AI powered by [Claude/OpenAI](https://claude.ai)
