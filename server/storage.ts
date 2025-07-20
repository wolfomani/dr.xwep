import { users, projects, files, aiSessions, type User, type InsertUser, type Project, type InsertProject, type File, type InsertFile, type AiSession, type InsertAiSession } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProjectId(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, file: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;

  // AI Session operations
  getAiSession(id: number): Promise<AiSession | undefined>;
  getAiSessionsByUserId(userId: number): Promise<AiSession[]>;
  createAiSession(session: InsertAiSession): Promise<AiSession>;
  updateAiSession(id: number, session: Partial<AiSession>): Promise<AiSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private aiSessions: Map<number, AiSession>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentFileId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.aiSessions = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentFileId = 1;
    this.currentSessionId = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    const demoUser = await this.createUser({
      username: 'demo',
      password: 'demo'
    });

    // Create demo project
    const demoProject = await this.createProject({
      name: 'My AI Project',
      description: 'A sample project showcasing AI-powered development',
      userId: demoUser.id
    });

    // Create demo files
    await this.createFile({
      name: 'main.py',
      path: 'main.py',
      content: `import numpy as np
from sklearn.model_selection import train_test_split

# AI-powered data analysis
def analyze_data(data):
    """تحليل البيانات باستخدام الذكاء الاصطناعي"""
    X = data.drop('target', axis=1)
    y = data['target']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test

if __name__ == "__main__":
    print("Starting AI analysis...")`,
      language: 'python',
      projectId: demoProject.id
    });

    await this.createFile({
      name: 'utils.js',
      path: 'utils.js',
      content: `// Utility functions for AI development
export const formatData = (data) => {
  return data.map(item => ({
    ...item,
    timestamp: new Date().toISOString()
  }));
};

export const validateInput = (input) => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }
  return input.trim();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};`,
      language: 'javascript',
      projectId: demoProject.id
    });

    await this.createFile({
      name: 'README.md',
      path: 'README.md',
      content: `# AI Code Studio Project

This is a sample project created in AI Code Studio, demonstrating the power of AI-assisted development.

## Features

- 🤖 AI-powered code generation
- 🔍 Intelligent code analysis
- 🐛 Automated debugging assistance
- ⚡ Real-time code execution
- 📝 Smart documentation generation

## Getting Started

1. Open any file in the editor
2. Use the AI assistant for help with:
   - Code generation
   - Bug fixing
   - Code explanation
   - Performance optimization

## Commands

Use the terminal to run your code:
- \`python main.py\` - Run Python files
- \`node utils.js\` - Run JavaScript files
- \`run\` - Execute the current file

Happy coding! 🚀
`,
      language: 'markdown',
      projectId: demoProject.id
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      ...insertProject,
      id,
      description: insertProject.description ?? null,
      userId: insertProject.userId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = {
      ...project,
      ...projectUpdate,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProjectId(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId,
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = {
      ...insertFile,
      id,
      content: insertFile.content ?? null,
      language: insertFile.language ?? null,
      projectId: insertFile.projectId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, fileUpdate: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = {
      ...file,
      ...fileUpdate,
      updatedAt: new Date(),
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getAiSession(id: number): Promise<AiSession | undefined> {
    return this.aiSessions.get(id);
  }

  async getAiSessionsByUserId(userId: number): Promise<AiSession[]> {
    return Array.from(this.aiSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async createAiSession(insertSession: InsertAiSession): Promise<AiSession> {
    const id = this.currentSessionId++;
    const session: AiSession = {
      ...insertSession,
      id,
      userId: insertSession.userId ?? null,
      messages: insertSession.messages ?? [],
      createdAt: new Date(),
    };
    this.aiSessions.set(id, session);
    return session;
  }

  async updateAiSession(id: number, sessionUpdate: Partial<AiSession>): Promise<AiSession | undefined> {
    const session = this.aiSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...sessionUpdate,
    };
    this.aiSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
