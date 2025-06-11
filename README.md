# Inkspire

AI-Powered Infinite Canvas for Creative Collaboration & Brainstorming

A modern web application that provides an infinite canvas for creating, organizing, and collaborating on ideas. Built with cutting-edge technologies and featuring AI assistance for enhanced creativity.

## ✨ Features

### Core Canvas Functionality
- **Infinite Canvas**: Seamless pan and zoom navigation with smooth interactions
- **Multi-Element Support**: Create sticky notes, shapes, text elements, and more
- **Real-time Selection**: Single and multi-element selection with Ctrl+click support
- **Professional UI**: Dark theme with glassmorphic effects and smooth animations

### Element Types
- **Sticky Notes**: Editable notes with customizable colors and text
- **Shapes**: Rectangle, circle, triangle, star, diamond, and arrow shapes
- **Text Elements**: Rich text with font customization and formatting
- **Smart Positioning**: Elements automatically position based on viewport center

### Productivity Features
- **Keyboard Shortcuts**: Complete set for efficiency
  - Navigation: `1` (select), `2` (pan), `S` (sticky), `T` (text), `R` (rectangle)
  - Actions: `Ctrl+Z/Y` (undo/redo), `Ctrl+C/V` (copy/paste), `Ctrl+A` (select all)
  - Management: `Delete/Backspace` (delete), `Escape` (deselect)
- **Copy/Paste**: Full element duplication with position offsetting
- **Undo/Redo**: Complete history management with 50-step memory
- **Auto-save**: Real-time synchronization with backend database

### AI Integration
- **Smart Generation**: Create elements from natural language descriptions
- **Board Analysis**: Get insights and suggestions for your canvas content
- **Contextual Assistance**: AI understands your canvas layout and content

## 🏗️ Architecture

### Frontend (`/apps/web`)
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: TailwindCSS with custom design system
- **Canvas**: Konva.js for high-performance 2D graphics
- **State Management**: React hooks with optimized re-rendering
- **API Layer**: Type-safe API client with error handling

### Backend (`/apps/api`)
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **AI Services**: LangChain integration with OpenAI for intelligent features
- **Authentication**: JWT-ready architecture (currently mock implementation)
- **CORS**: Configured for development and production environments

### Database Schema
- **Users**: Authentication and user management
- **Boards**: Canvas workspaces with metadata
- **BoardElements**: Flexible JSON-based element storage
- **Relationships**: Proper foreign keys and cascading deletes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- PostgreSQL database
- Optional: Docker for database

### 1. Database Setup
```bash
# Using Docker (recommended)
docker-compose up -d

# Or start your local PostgreSQL and create database 'inkspire'
```

### 2. Backend Setup
```bash
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # Edit with your database URL

# Generate Prisma client (if needed)
cd ../../packages/db
prisma generate
cd ../../apps/api

# Start the API server
uvicorn main:app --reload --port 8001
```

### 3. Frontend Setup
```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8001/docs
- **Database Admin**: Use your preferred PostgreSQL client

## 📖 API Reference

### Board Management
- `GET /api/boards` - List all boards
- `POST /api/boards` - Create new board
- `GET /api/boards/{id}` - Get specific board
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board

### Element Operations
- `GET /api/elements/board/{boardId}` - Get board elements
- `POST /api/elements` - Create new element
- `PUT /api/elements/{id}` - Update element
- `DELETE /api/elements/{id}` - Delete element

### AI Features
- `POST /api/ai/generate` - Generate elements from text
- `POST /api/ai/analyze` - Analyze board content

## 🛠️ Development

### Project Structure
```
inkspire/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # FastAPI backend service
├── packages/
│   └── db/           # Shared Prisma schema and types
├── docker-compose.yml # PostgreSQL database setup
└── README.md         # This file
```

### Tech Stack Details
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS 4, Konva.js
- **Backend**: FastAPI, Prisma, LangChain, OpenAI API
- **Database**: PostgreSQL with JSON support for flexible schemas
- **Development**: ESLint, TypeScript, Hot reload, API proxy

### Code Quality
- **TypeScript**: Full type safety across frontend and backend
- **Linting**: ESLint with Next.js and TypeScript rules
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Performance**: Optimized rendering, debounced updates, lazy loading

## 🎯 Current Status

### ✅ Completed Features
- [x] Monorepo architecture with proper workspace setup
- [x] Next.js frontend with modern React patterns
- [x] FastAPI backend with automatic documentation
- [x] Infinite canvas with Konva.js integration
- [x] Complete CRUD operations for boards and elements
- [x] Real-time element manipulation and persistence
- [x] Professional UI with dark theme and animations
- [x] Comprehensive keyboard shortcuts and productivity features
- [x] Multi-selection and clipboard operations
- [x] AI-powered content generation and analysis
- [x] Type-safe API layer with error handling
- [x] Database schema with proper relationships

### 🚧 In Development
- [ ] User authentication and authorization
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced export options (PDF, PNG, SVG)
- [ ] Enhanced AI features and suggestions
- [ ] Mobile responsiveness improvements
- [ ] Performance optimizations for large canvases

### 🔮 Future Roadmap
- [ ] Team workspaces and permissions
- [ ] Version history and branching
- [ ] Plugin system for custom elements
- [ ] Advanced AI image generation
- [ ] Integration with external tools (Figma, Miro)
- [ ] Offline support with sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by tools like Miro, Figma, and Excalidraw
- Powered by OpenAI for intelligent features

---

For workspace-specific development instructions, see `.github/copilot-instructions.md`.
