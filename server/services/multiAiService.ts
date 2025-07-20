import OpenAI from "openai";

interface AIModel {
  name: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class MultiAIService {
  private models: Map<string, AIModel> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // DeepSeek (Primary)
    if (process.env.DEEPSEEK_API_KEY) {
      this.models.set('deepseek', {
        name: 'DeepSeek Reasoner',
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-reasoner'
      });
    }

    // Groq (Fast inference)
    if (process.env.GROQ_API_KEY) {
      this.models.set('groq', {
        name: 'Groq Llama 3.3 70B',
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
        model: 'llama-3.3-70b-versatile'
      });
    }

    // Together DeepSeek-V3 (Advanced)
    if (process.env.TOGETHER_API_KEY) {
      this.models.set('deepseek-v3', {
        name: 'DeepSeek-V3 (Together)',
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: 'https://api.together.xyz/v1',
        model: 'deepseek-ai/DeepSeek-V3'
      });
    }
  }

  async chat(modelName: string, messages: ChatMessage[], stream: boolean = false): Promise<string> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not available`);
    }

    const client = new OpenAI({
      apiKey: model.apiKey,
      baseURL: model.baseURL,
    });

    try {
      const response = await client.chat.completions.create({
        model: model.model,
        messages,
        stream,
        max_tokens: 4000,
        temperature: 0.7,
      });

      if (stream) {
        // Handle streaming response
        return 'Streaming not implemented in this version';
      } else {
        return response.choices[0]?.message?.content || 'No response';
      }
    } catch (error) {
      console.error(`Error with ${modelName}:`, error);
      throw new Error(`Failed to get response from ${modelName}`);
    }
  }

  async generateCode(prompt: string, language: string, modelName: string = 'deepseek'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert programmer. Generate clean, well-commented ${language} code based on the user's request. Only return the code, no explanations.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.chat(modelName, messages);
  }

  async explainCode(code: string, language: string, modelName: string = 'deepseek'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a code teacher. Explain the given code clearly and concisely, including what it does, how it works, and any important concepts.'
      },
      {
        role: 'user',
        content: `Explain this ${language} code:\n\n${code}`
      }
    ];

    return this.chat(modelName, messages);
  }

  async debugCode(code: string, error: string, language: string, modelName: string = 'deepseek'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a debugging expert. Analyze the code and error, then provide a solution with the corrected code.'
      },
      {
        role: 'user',
        content: `Debug this ${language} code that has an error:\n\nCode:\n${code}\n\nError:\n${error}`
      }
    ];

    return this.chat(modelName, messages);
  }

  async optimizeCode(code: string, language: string, modelName: string = 'deepseek'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a code optimization expert. Analyze the given code and provide an optimized version with explanations of improvements.'
      },
      {
        role: 'user',
        content: `Optimize this ${language} code:\n\n${code}`
      }
    ];

    return this.chat(modelName, messages);
  }

  getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }

  getModelInfo(modelName: string): AIModel | undefined {
    return this.models.get(modelName);
  }
}

export const multiAiService = new MultiAIService();