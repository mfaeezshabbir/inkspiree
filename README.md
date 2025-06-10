# Inkspire

AI-powered Infinite Canvas for Brainstorming & Storyboarding

## Tech Stack
- **Frontend:** Next.js (App Router, TailwindCSS, Konva.js)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (Prisma ORM)
- **Collaboration:** WebSockets (future)
- **AI:** LangChain, OpenAI API, image generation (future)

## Getting Started

### Frontend
```
cd apps/web
npm install
npm run dev
```

### Backend
```
cd apps/api
source venv/bin/activate
uvicorn main:app --reload
```

---

## Roadmap
- [x] Monorepo structure
- [x] Next.js frontend scaffold
- [x] FastAPI backend scaffold
- [x] Infinite canvas (Konva.js)
- [x] AI endpoints
- [ ] Prisma/PostgreSQL setup
- [ ] Real-time collaboration
- [ ] Export options

---

For workspace-specific Copilot instructions, see `.github/copilot-instructions.md`.
