import OpenAI from "openai";

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CodeGenerationRequest {
  prompt: string;
  language: string;
  context?: string;
}

interface CodeExplanationRequest {
  code: string;
  language: string;
}

interface DebugRequest {
  code: string;
  error: string;
  language: string;
}

export class AIOrchestrator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
    });
  }

  async generateCode(request: CodeGenerationRequest): Promise<string> {
    try {
      const systemPrompt = `You are an expert programmer. Generate clean, efficient, and well-commented code in ${request.language}. 
      ${request.context ? `Context: ${request.context}` : ''}
      Provide only the code without additional explanations unless specifically requested.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.prompt }
        ],
        temperature: 0.2,
        max_tokens: 2048,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  async explainCode(request: CodeExplanationRequest): Promise<string> {
    try {
      const systemPrompt = `You are a coding instructor. Explain the provided ${request.language} code in a clear, educational manner. 
      Break down the logic, explain key concepts, and highlight important patterns or best practices.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Explain this code:\n\n${request.code}` }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Code explanation failed: ${error.message}`);
    }
  }

  async debugCode(request: DebugRequest): Promise<string> {
    try {
      const systemPrompt = `You are a debugging expert. Analyze the provided ${request.language} code and error message. 
      Identify the issue, explain why it's happening, and provide a corrected version of the code with explanations.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Debug this code:\n\nCode:\n${request.code}\n\nError:\n${request.error}` }
        ],
        temperature: 0.1,
        max_tokens: 1536,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Code debugging failed: ${error.message}`);
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    try {
      const systemPrompt = `You are a code optimization expert. Analyze the provided ${language} code and suggest optimizations for performance, readability, and best practices. Provide the improved code with explanations of changes.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Optimize this code:\n\n${code}` }
        ],
        temperature: 0.2,
        max_tokens: 2048,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`Code optimization failed: ${error.message}`);
    }
  }

  async chatWithAI(messages: AIMessage[]): Promise<string> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      throw new Error(`AI chat failed: ${error.message}`);
    }
  }
}
