import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Copy, Download, Trash2, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface AIChatProps {
  className?: string;
  currentCode?: string;
  currentLanguage?: string;
  onCodeInsert?: (code: string) => void;
}

export function AIChat({ className, currentCode, currentLanguage, onCodeInsert }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [availableModels, setAvailableModels] = useState<string[]>(['deepseek', 'groq', 'deepseek-v3']);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load available models
    fetch('/api/ai/models')
      .then(res => res.json())
      .then(data => {
        if (data.models) {
          setAvailableModels(data.models);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          context: {
            code: currentCode,
            language: currentLanguage,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date(),
        model: selectedModel,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: 'Copied',
        description: 'Message copied to clipboard',
      });
    });
  };

  const insertCode = (content: string) => {
    // Extract code blocks from the message
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = content.match(codeBlockRegex);
    
    if (matches && matches.length > 0) {
      // Get the first code block and remove the markdown syntax
      const codeBlock = matches[0].replace(/```[\w]*\n/, '').replace(/```$/, '');
      onCodeInsert?.(codeBlock);
      toast({
        title: 'Code Inserted',
        description: 'Code has been inserted into the editor',
      });
    } else {
      // If no code blocks, insert the whole message
      onCodeInsert?.(content);
      toast({
        title: 'Text Inserted',
        description: 'Content has been inserted into the editor',
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed',
    });
  };

  const exportChat = () => {
    const chatData = {
      messages,
      exportedAt: new Date().toISOString(),
      model: selectedModel,
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drx-ai-chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Chat Exported',
      description: 'Chat history has been downloaded',
    });
  };

  const quickPrompts = [
    'Explain this code',
    'Debug this code',
    'Optimize this code',
    'Add comments',
    'Convert to TypeScript',
    'Add error handling',
    'Write unit tests',
    'Refactor this function',
  ];

  return (
    <div className={cn("flex flex-col h-full bg-gray-950/50 border border-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {selectedModel}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={exportChat}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="p-3 border-b border-gray-800/50">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model.charAt(0).toUpperCase() + model.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Prompts */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-gray-800/50">
          <p className="text-sm text-gray-400 mb-3">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                size="sm"
                variant="outline"
                onClick={() => setInput(prompt)}
                className="h-7 text-xs bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">
                Start a conversation with AI to get help with your code
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "group flex gap-3 p-3 rounded-lg",
                  message.role === 'user'
                    ? "bg-blue-500/10 border border-blue-500/20 ml-8"
                    : "bg-gray-800/30 border border-gray-700/50 mr-8"
                )}
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    {message.model && (
                      <Badge variant="outline" className="text-xs h-5 border-gray-600 text-gray-400">
                        {message.model}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                      {message.content}
                    </pre>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(message.content)}
                      className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    {message.role === 'assistant' && onCodeInsert && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => insertCode(message.content)}
                        className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
                      >
                        Insert
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 mr-8">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white">AI Assistant</span>
                  <Badge variant="outline" className="text-xs h-5 border-gray-600 text-gray-400">
                    {selectedModel}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-gray-800" />

      {/* Input */}
      <div className="p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI anything about your code..."
            disabled={isLoading}
            className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}