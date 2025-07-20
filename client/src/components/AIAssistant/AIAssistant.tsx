import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bot, 
  User, 
  Code, 
  Bug, 
  Lightbulb, 
  Zap, 
  Send, 
  Loader2 
} from 'lucide-react';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeFile } = useFileSystem();
  const { sendMessage } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI mutations for different actions
  const generateCodeMutation = useMutation({
    mutationFn: async (data: { prompt: string; language: string; context?: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate', data);
      return response.json();
    },
  });

  const explainCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const response = await apiRequest('POST', '/api/ai/explain', data);
      return response.json();
    },
  });

  const debugCodeMutation = useMutation({
    mutationFn: async (data: { code: string; error: string; language: string }) => {
      const response = await apiRequest('POST', '/api/ai/debug', data);
      return response.json();
    },
  });

  const optimizeCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const response = await apiRequest('POST', '/api/ai/optimize', data);
      return response.json();
    },
  });

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const message: AIMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Send via WebSocket for real-time response
      const response = await sendMessage({
        type: 'ai_request',
        action: 'chat',
        payload: {
          messages: [
            ...messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: 'user', content: userMessage }
          ]
        }
      });

      if (response.result) {
        addMessage('assistant', response.result);
      }
    } catch (error) {
      addMessage('assistant', 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: 'generate' | 'explain' | 'debug' | 'optimize') => {
    if (!activeFile || isLoading) return;

    setIsLoading(true);
    let actionText = '';
    let result = '';

    try {
      switch (action) {
        case 'generate':
          actionText = 'توليد كود جديد';
          addMessage('user', `${actionText} للملف ${activeFile.name}`);
          const generateResult = await generateCodeMutation.mutateAsync({
            prompt: `Generate code for ${activeFile.name}`,
            language: activeFile.language || 'javascript',
            context: activeFile.content
          });
          result = generateResult.result;
          break;

        case 'explain':
          actionText = 'شرح الكود';
          addMessage('user', `${actionText} في الملف ${activeFile.name}`);
          const explainResult = await explainCodeMutation.mutateAsync({
            code: activeFile.content || '',
            language: activeFile.language || 'javascript'
          });
          result = explainResult.result;
          break;

        case 'debug':
          actionText = 'تصحيح الأخطاء';
          addMessage('user', `${actionText} في الملف ${activeFile.name}`);
          const debugResult = await debugCodeMutation.mutateAsync({
            code: activeFile.content || '',
            error: 'Please analyze this code for potential issues',
            language: activeFile.language || 'javascript'
          });
          result = debugResult.result;
          break;

        case 'optimize':
          actionText = 'تحسين الكود';
          addMessage('user', `${actionText} في الملف ${activeFile.name}`);
          const optimizeResult = await optimizeCodeMutation.mutateAsync({
            code: activeFile.content || '',
            language: activeFile.language || 'javascript'
          });
          result = optimizeResult.result;
          break;
      }

      if (result) {
        addMessage('assistant', result);
      }
    } catch (error) {
      addMessage('assistant', `عذراً، حدث خطأ أثناء ${actionText}. يرجى المحاولة مرة أخرى.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="glassmorphism border-l border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-300">مساعد الذكاء الاصطناعي</h3>
            <p className="text-xs text-gray-500">OpenAI GPT-4o</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-xs h-auto py-2 flex-col"
            onClick={() => handleQuickAction('generate')}
            disabled={!activeFile || isLoading}
          >
            <Code className="w-4 h-4 mb-1" />
            توليد كود
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-xs h-auto py-2 flex-col"
            onClick={() => handleQuickAction('debug')}
            disabled={!activeFile || isLoading}
          >
            <Bug className="w-4 h-4 mb-1" />
            تصحيح أخطاء
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-xs h-auto py-2 flex-col"
            onClick={() => handleQuickAction('explain')}
            disabled={!activeFile || isLoading}
          >
            <Lightbulb className="w-4 h-4 mb-1" />
            شرح الكود
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30 text-xs h-auto py-2 flex-col"
            onClick={() => handleQuickAction('optimize')}
            disabled={!activeFile || isLoading}
          >
            <Zap className="w-4 h-4 mb-1" />
            تحسين
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm animate-fade-in">
              مرحباً! كيف يمكنني مساعدتك في البرمجة اليوم؟
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`flex-1 rounded-lg p-3 max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-blue-500/20 text-right' 
                    : 'bg-gray-800/50'
                }`}>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-300">جارٍ التفكير...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            placeholder="اسأل المساعد..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 placeholder-gray-500 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};
