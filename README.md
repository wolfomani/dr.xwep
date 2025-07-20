# DRX AI Hub - منصة البرمجة المدعومة بالذكاء الاصطناعي

## Overview

منصة DRX AI Hub هي بيئة تطوير متكاملة متقدمة مبنية بـ React وTypeScript وNode.js وExpress. تتميز المنصة بـ Monaco Editor المتقدم، مساعدة الذكاء الاصطناعي في الوقت الفعلي، إدارة الملفات، وتنفيذ الكود مع دعم نماذج AI متعددة.

## User Preferences

Preferred communication style: Arabic with simple explanations
Primary AI Models: DeepSeek, Groq (Llama 3.3 70B), DeepSeek-V3 via Together
UI Language: Arabic interface with English code
Brand: DRX with red-orange logo and dark theme

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Custom components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API with WebSocket support
- **Real-time Communication**: WebSocket Server for live features

## Key Components

### Code Editor
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Language Support**: Multiple programming languages (JavaScript, TypeScript, Python, etc.)
- **Theme**: Custom dark theme ("ai-dark") optimized for coding
- **Features**: Auto-completion, syntax validation, code folding, minimap

### AI Integration
- **Primary Models**: DeepSeek Reasoner, Groq Llama 3.3 70B, DeepSeek-V3 via Together
- **Default Model**: DeepSeek as primary choice
- **Capabilities**: Code generation, explanation, debugging, optimization, and chat
- **Real-time**: WebSocket-based communication for instant AI responses
- **Multi-Model Support**: Users can switch between available AI models

### File System
- **Project Management**: Multi-project support with file organization
- **File Operations**: Create, read, update, delete operations
- **Language Detection**: Automatic language detection from file extensions
- **Content Management**: Real-time file content synchronization

### Database Schema
- **Users**: User authentication and profile management
- **Projects**: Project metadata and ownership
- **Files**: File content, paths, and language information
- **AI Sessions**: Chat history and AI interaction logging

## Data Flow

1. **User Authentication**: Simple user system with demo user (ID: 1)
2. **Project Selection**: Users can create and select projects
3. **File Management**: Files are associated with projects and stored with metadata
4. **Code Editing**: Monaco Editor provides real-time editing with auto-save
5. **AI Assistance**: WebSocket connection enables real-time AI interactions
6. **Code Execution**: Simulated code execution with results display

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database adapter (prepared for Neon)
- **drizzle-orm**: Type-safe ORM for database operations
- **monaco-editor**: Code editor component
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket implementation
- **openai**: Official OpenAI API client

### UI Dependencies
- **@radix-ui/**: Complete set of UI primitives for components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle Kit for schema management and migrations
- **Environment**: NODE_ENV-based configuration

### Production
- **Build Process**: 
  1. Vite builds frontend to `dist/public`
  2. esbuild bundles backend to `dist/index.js`
- **Server**: Node.js serves both API and static files
- **Database**: PostgreSQL with connection string from environment
- **Deployment**: Single deployment with both frontend and backend

### Architecture Decisions

**Problem**: Need for real-time AI assistance in code editor
**Solution**: WebSocket integration with OpenAI API
**Rationale**: Provides instant feedback and maintains conversation context

**Problem**: Complex UI component requirements
**Solution**: Radix UI primitives with custom styling
**Rationale**: Accessible, customizable, and production-ready components

**Problem**: Type-safe database operations
**Solution**: Drizzle ORM with shared schema
**Rationale**: Full TypeScript support and shared types between frontend/backend

**Problem**: Code editor functionality
**Solution**: Monaco Editor (VS Code editor)
**Rationale**: Feature-rich, extensible, and familiar to developers

**Problem**: Fast development and build times
**Solution**: Vite for frontend, tsx for backend development
**Rationale**: Excellent TypeScript support and fast hot reloading

The application is designed to be easily deployed on Replit with minimal configuration, supporting both development and production environments.
