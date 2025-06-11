# Inkspiree Web Application

The Next.js frontend application for Inkspiree - an AI-powered infinite canvas for creative collaboration. This modern React application provides an intuitive interface for creating, organizing, and collaborating on ideas through an infinite canvas experience.

## ✨ Features

### Canvas Experience
- **Infinite Canvas**: Seamless pan and zoom with mouse wheel and touch support
- **High Performance**: Powered by Konva.js for smooth 60fps interactions
- **Responsive Design**: Adapts to different screen sizes and devices
- **Dark Theme**: Professional dark interface with glassmorphic effects
- **Real-time Updates**: Live synchronization with backend for collaborative editing

### Element Creation & Management
- **Multiple Element Types**:
  - Sticky Notes with rich text editing
  - Geometric shapes (rectangle, circle, triangle, star, diamond, arrow)
  - Text elements with font customization
  - Future: Images, connectors, and custom elements

- **Advanced Selection**:
  - Single-click selection with visual feedback
  - Multi-selection with Ctrl+click
  - Selection indicators and drag handles
  - Bulk operations on selected elements

### User Experience
- **Keyboard Shortcuts**: Complete set for power users
  - Tools: `1` (select), `2` (pan), `S` (sticky), `T` (text), `R` (rectangle)
  - Actions: `Ctrl+Z/Y` (undo/redo), `Ctrl+C/V` (copy/paste)
  - Management: `Delete` (remove), `Escape` (deselect), `Ctrl+A` (select all)

- **Modern UI Components**:
  - Floating glassmorphic toolbar
  - Real-time status bar with canvas metrics
  - Smooth animations and transitions
  - Professional loading states and error handling

### AI Integration
- **Smart Content Generation**: Create elements from natural language
- **Board Analysis**: Get insights and suggestions for your canvas
- **Contextual AI**: AI understands your canvas layout and provides relevant suggestions

## 🏗️ Tech Stack

### Core Technologies
- **[Next.js 15](https://nextjs.org/)**: React framework with App Router and TypeScript
- **[React 19](https://react.dev/)**: Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the application
- **[TailwindCSS 4](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Konva.js](https://konvajs.org/)**: 2D canvas library for high-performance graphics

### Development Tools
- **ESLint**: Code linting with Next.js and TypeScript rules
- **Turbopack**: Ultra-fast bundler for development
- **PostCSS**: CSS processing and optimization
- **Font Optimization**: Next.js font loading with Inter font

### Architecture
- **Component-Based**: Modular React components with clear separation of concerns
- **Type-Safe API**: Strongly typed API layer with request/response validation
- **State Management**: React hooks with optimized re-rendering strategies
- **Error Boundaries**: Comprehensive error handling and user feedback

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Backend API**: Inkspiree API running on port 8001

### Installation

1. **Install Dependencies**
```bash
cd apps/web
npm install
```

2. **Environment Setup**
The application uses Next.js API proxy, so no additional environment configuration is needed for development.

3. **Start Development Server**
```bash
npm run dev
```

4. **Access Application**
- **Frontend**: http://localhost:3000
- **Development Tools**: Available in browser dev tools

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build production application
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🎨 User Interface

### Canvas Interface
- **Main Canvas**: Infinite scrollable area with grid background
- **Floating Toolbar**: Always-accessible tool selection
- **Status Bar**: Real-time information about canvas state
- **Element Properties**: Dynamic panels for selected elements

### Design System
- **Color Palette**: Professional dark theme with accent colors
- **Typography**: Inter font family with optimized loading
- **Spacing**: Consistent 8px grid system
- **Effects**: Glassmorphism, gradients, and smooth animations

### Responsive Design
- **Desktop First**: Optimized for desktop creative workflows
- **Tablet Support**: Touch-friendly interactions
- **Mobile Adaptation**: Core functionality on mobile devices

## 🔧 Development

### Project Structure
```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Global styles and design system
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Homepage
│   │   └── boards/             # Board-related pages
│   │       ├── page.tsx        # Boards listing
│   │       └── [boardId]/      # Individual board pages
│   ├── components/             # React components
│   │   ├── BoardCanvas.tsx     # Main canvas component
│   │   ├── AIDialog.tsx        # AI interaction modal
│   │   ├── Toolbar.tsx         # Canvas tools
│   │   └── ui/                 # Reusable UI components
│   ├── services/               # API and external services
│   │   └── api.ts              # Type-safe API client
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Shared types
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.ts              # Next.js configuration
```

### Component Architecture

#### BoardCanvas Component
The main canvas component handling:
- Canvas rendering with Konva.js
- Element lifecycle management
- User interactions (pan, zoom, select)
- Real-time synchronization with backend

#### API Integration
Type-safe API client with:
- Automatic request/response validation
- Error handling and retry logic
- Optimistic updates for better UX
- Request debouncing for performance

#### State Management
- **Local State**: React hooks for component-specific state
- **Shared State**: Context providers for global state
- **Server State**: API responses cached and synchronized
- **History Management**: Undo/redo with state snapshots

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Loading**: Optimized web font loading
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Memory Management**: Proper cleanup of canvas resources

### TypeScript Integration
- **Strict Mode**: Full TypeScript strict mode enabled
- **API Types**: Generated types from backend schema
- **Component Props**: Strongly typed component interfaces
- **Event Handlers**: Type-safe event handling

## 🎯 Canvas Features

### Element Types

#### Sticky Notes
```typescript
{
  type: "sticky-note",
  content: {
    text: "Note content",
    color: "#fbbf24"
  },
  position: { x: 100, y: 200 },
  size: { width: 200, height: 150 }
}
```

#### Shapes
```typescript
{
  type: "shape",
  content: {
    shapeType: "rectangle" | "ellipse" | "triangle" | "star" | "diamond" | "arrow"
  },
  style: {
    fill: "#3b82f6",
    stroke: "#2563eb",
    strokeWidth: 2
  }
}
```

#### Text Elements
```typescript
{
  type: "text",
  content: {
    text: "Text content",
    fontSize: 18,
    fontFamily: "Inter"
  },
  style: {
    fill: "#1f2937"
  }
}
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `1` | Select tool |
| `2` | Pan tool |
| `S` | Create sticky note |
| `T` | Create text |
| `R` | Create rectangle |
| `C` | Create circle |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy selection |
| `Ctrl+V` | Paste |
| `Ctrl+A` | Select all |
| `Delete` | Delete selection |
| `Escape` | Clear selection |

### Canvas Navigation
- **Mouse Wheel**: Zoom in/out
- **Middle Click + Drag**: Pan canvas
- **Pan Tool**: Dedicated pan mode
- **Zoom Controls**: UI buttons for zoom
- **Fit to Screen**: Auto-fit content

## 🔄 API Integration

### Type-Safe Client
```typescript
// Boards API
const boards = await boardsApi.getBoards();
const board = await boardsApi.getBoard(id);
const newBoard = await boardsApi.createBoard({ title, description });

// Elements API
const elements = await elementsApi.getBoardElements(boardId);
const element = await elementsApi.createElement(elementData);
const updated = await elementsApi.updateElement(id, changes);

// AI API
const generated = await aiApi.generateElements({ text, boardId });
const analysis = await aiApi.analyzeBoard(boardId);
```

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: User-friendly error messages
- **Server Errors**: Graceful degradation and error reporting
- **Offline Support**: Queued operations for when connection returns

## 🚀 Production Build

### Build Optimization
```bash
# Create optimized production build
npm run build

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Deployment
The application is ready for deployment on:
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Static site hosting with serverless functions
- **Docker**: Containerized deployment
- **Traditional Hosting**: Static export capability

## 🧪 Testing

### Test Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

### Test Coverage
- **Component Testing**: React Testing Library
- **Integration Testing**: API integration tests
- **E2E Testing**: Canvas interaction tests
- **Visual Regression**: Screenshot comparison tests

## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Create your fork
2. **Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Development**: Follow coding standards
4. **Testing**: Ensure tests pass
5. **Pull Request**: Submit for review

### Code Standards
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting
- **TypeScript**: Full type coverage
- **Component Structure**: Consistent patterns
- **Performance**: Optimize for 60fps

### Git Conventions
- **Commit Messages**: Use conventional commits
- **Branch Naming**: `feature/`, `fix/`, `docs/`
- **PR Template**: Follow provided template

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Canvas & Graphics
- [Konva.js Documentation](https://konvajs.org/docs/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [2D Graphics Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 📄 License

This project is part of the Inkspiree application suite and follows the same license terms as the main project.
