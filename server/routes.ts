import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { AIOrchestrator } from "./services/aiOrchestrator";
import { CodeExecutor } from "./services/codeExecutor";
import { multiAiService } from "./services/multiAiService";
import { insertProjectSchema, insertFileSchema, insertAiSessionSchema } from "@shared/schema";

function handleError(error: unknown): string {
  return error instanceof Error ? handleError(error) : 'Unknown error';
}

export async function registerRoutes(app: Express): Promise<Server> {
  const aiOrchestrator = new AIOrchestrator();
  const codeExecutor = new CodeExecutor();

  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      // For demo purposes, using userId = 1
      const projects = await storage.getProjectsByUserId(1);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: 1 // For demo purposes
      });
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // Files API
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const files = await storage.getFilesByProjectId(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/projects/:projectId/files", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const fileData = insertFileSchema.parse({
        ...req.body,
        projectId
      });
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  app.put("/api/files/:fileId", async (req, res) => {
    try {
      const fileId = parseInt(req.params.fileId);
      const updatedFile = await storage.updateFile(fileId, req.body);
      if (!updatedFile) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(updatedFile);
    } catch (error) {
      res.status(400).json({ error: handleError(error) });
    }
  });

  // AI Models API
  app.get("/api/ai/models", async (req, res) => {
    try {
      const models = multiAiService.getAvailableModels();
      res.json({ models });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // AI Chat API
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, model, context } = req.body;
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert programming assistant. Help with code questions, debugging, and development tasks.'
        },
        {
          role: 'user' as const,
          content: context?.code ? 
            `Context: I'm working with ${context.language} code:\n\n${context.code}\n\nQuestion: ${message}` :
            message
        }
      ];
      
      const response = await multiAiService.chat(model || 'deepseek', messages);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // AI API
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, language, context, model } = req.body;
      const result = await multiAiService.generateCode(prompt, language, model || 'deepseek');
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { code, language, model } = req.body;
      const result = await multiAiService.explainCode(code, language, model || 'deepseek');
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/ai/debug", async (req, res) => {
    try {
      const { code, error, language, model } = req.body;
      const result = await multiAiService.debugCode(code, error, language, model || 'deepseek');
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  app.post("/api/ai/optimize", async (req, res) => {
    try {
      const { code, language, model } = req.body;
      const result = await multiAiService.optimizeCode(code, language, model || 'deepseek');
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Conversations API
  app.get("/api/conversations", async (req, res) => {
    try {
      // For demo purposes, return sample conversations
      const conversations = [
        {
          id: '1',
          title: 'محادثة تجريبية',
          messages: [],
          model: 'deepseek',
          createdAt: new Date(),
        }
      ];
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  // Code execution API
  app.post("/api/execute", async (req, res) => {
    try {
      const { code, language, input } = req.body;
      const validation = codeExecutor.validateCode(code, language);
      
      if (!validation.valid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }
      
      const result = await codeExecutor.executeCode({ code, language, input });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: handleError(error) });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'code_execution':
            const validation = codeExecutor.validateCode(data.code, data.language);
            if (!validation.valid) {
              ws.send(JSON.stringify({
                type: 'execution_result',
                id: data.id,
                success: false,
                error: validation.errors.join(', ')
              }));
              return;
            }
            
            const result = await codeExecutor.executeCode({
              code: data.code,
              language: data.language,
              input: data.input
            });
            
            ws.send(JSON.stringify({
              type: 'execution_result',
              id: data.id,
              ...result
            }));
            break;

          case 'ai_request':
            let aiResult;
            switch (data.action) {
              case 'generate':
                aiResult = await aiOrchestrator.generateCode(data.payload);
                break;
              case 'explain':
                aiResult = await aiOrchestrator.explainCode(data.payload);
                break;
              case 'debug':
                aiResult = await aiOrchestrator.debugCode(data.payload);
                break;
              case 'optimize':
                aiResult = await aiOrchestrator.optimizeCode(data.payload.code, data.payload.language);
                break;
              case 'chat':
                aiResult = await aiOrchestrator.chatWithAI(data.payload.messages);
                break;
            }
            
            ws.send(JSON.stringify({
              type: 'ai_response',
              id: data.id,
              result: aiResult
            }));
            break;

          case 'file_update':
            if (data.fileId) {
              await storage.updateFile(data.fileId, {
                content: data.content,
                updatedAt: new Date()
              });
            }
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          error: handleError(error)
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
