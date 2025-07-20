import { useState, useEffect, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  MessageSquare,
  Send,
  Plus,
  Settings,
  Download,
  Share2,
  Trash2,
  Bot,
  User,
  Sparkles,
  Zap,
  Clock,
  MoreVertical,
  Copy,
  RefreshCw,
  Home,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import logoUrl from '@assets/drx-logo_1752989300116.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
}

const availableModels = [
  { id: 'deepseek', name: 'DeepSeek Reasoner', description: 'أفضل نموذج للاستدلال والبرمجة' },
  { id: 'groq', name: 'Groq Llama 3.3 70B', description: 'سريع ومتقدم للمحادثات العامة' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3 (Together)', description: 'النموذج الأحدث والأكثر تطوراً' },
];

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data);
      
      if (data.length > 0) {
        setCurrentConversation(data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Create a default conversation for demo
      const defaultConversation: Conversation = {
        id: '1',
        title: 'محادثة جديدة',
        messages: [],
        model: 'deepseek',
        createdAt: new Date(),
      };
      setConversations([defaultConversation]);
      setCurrentConversation(defaultConversation);
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    // Update conversation with user message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
    };
    setCurrentConversation(updatedConversation);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel,
          context: {
            temperature: temperature[0],
            maxTokens: maxTokens[0],
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'عذراً، لم أتمكن من الرد على رسالتك.',
        timestamp: new Date(),
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        title: updatedConversation.messages.length === 1 ? 
          userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '') :
          updatedConversation.title,
      };

      setCurrentConversation(finalConversation);
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => conv.id === finalConversation.id ? finalConversation : conv)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = (conversationId: string) => {
    const filtered = conversations.filter(conv => conv.id !== conversationId);
    setConversations(filtered);
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(filtered[0] || null);
    }
  };

  const exportConversation = () => {
    if (!currentConversation) return;

    const data = {
      title: currentConversation.title,
      model: currentConversation.model,
      messages: currentConversation.messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${currentConversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'تم التصدير',
      description: 'تم تصدير المحادثة بنجاح',
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الرسالة إلى الحافظة',
    });
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden"
          >
            {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              الرئيسية
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="DRX Logo" className="w-6 h-6" />
            <span className="font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              DRX AI Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar */}
          {showSidebar && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full bg-gray-900 border-r border-gray-800 flex flex-col">
                  {/* New Conversation Button */}
                  <div className="p-4 border-b border-gray-800">
                    <Button 
                      onClick={createNewConversation}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      محادثة جديدة
                    </Button>
                  </div>

                  {/* Conversations List */}
                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <Card
                          key={conversation.id}
                          className={cn(
                            "cursor-pointer transition-all duration-200 hover:bg-gray-800/50",
                            currentConversation?.id === conversation.id 
                              ? "bg-gray-800 border-gray-700" 
                              : "bg-gray-900/50 border-gray-800"
                          )}
                          onClick={() => setCurrentConversation(conversation)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-white truncate">
                                  {conversation.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {availableModels.find(m => m.id === conversation.model)?.name || conversation.model}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {conversation.messages.length} رسالة
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Chat Area */}
          <ResizablePanel defaultSize={showSidebar ? 50 : 75}>
            <div className="h-full flex flex-col">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-white">{currentConversation.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {availableModels.find(m => m.id === currentConversation.model)?.name || currentConversation.model}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {currentConversation.createdAt.toLocaleDateString('ar')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={exportConversation}
                          className="text-gray-400 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 max-w-4xl mx-auto">
                      {currentConversation.messages.length === 0 && (
                        <div className="text-center py-12">
                          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                          <h3 className="text-lg font-medium text-gray-400 mb-2">
                            ابدأ محادثة جديدة
                          </h3>
                          <p className="text-gray-500">
                            اكتب رسالتك أدناه للبدء في المحادثة مع الذكاء الاصطناعي
                          </p>
                        </div>
                      )}

                      {currentConversation.messages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex gap-3",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}>
                          {msg.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-3 relative group",
                            msg.role === 'user' 
                              ? "bg-blue-600 text-white" 
                              : "bg-gray-800 text-gray-100 border border-gray-700"
                          )}>
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {msg.content}
                            </pre>
                            
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <span>
                                {msg.timestamp.toLocaleTimeString('ar', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(msg.content)}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              جاري الكتابة...
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex gap-3">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          className="flex-1 min-h-[44px] max-h-32 bg-gray-800 border-gray-700 resize-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!message.trim() || isLoading}
                          className="h-11 px-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      مرحباً بك في DRX AI Hub
                    </h3>
                    <p className="text-gray-500 mb-4">
                      أنشئ محادثة جديدة للبدء في الدردشة مع الذكاء الاصطناعي
                    </p>
                    <Button 
                      onClick={createNewConversation}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      ابدأ محادثة جديدة
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          {/* Settings Panel */}
          {showSettings && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full bg-gray-900 border-l border-gray-800 p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    إعدادات النموذج
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        درجة الحرارة: {temperature[0]}
                      </label>
                      <Slider
                        value={temperature}
                        onValueChange={setTemperature}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        قيم أعلى = إجابات أكثر إبداعاً
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        الحد الأقصى للكلمات: {maxTokens[0]}
                      </label>
                      <Slider
                        value={maxTokens}
                        onValueChange={setMaxTokens}
                        max={4096}
                        min={256}
                        step={256}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        عدد الكلمات في الرد
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-white mb-3">النماذج المتاحة</h4>
                      <div className="space-y-2">
                        {availableModels.map((model) => (
                          <Card 
                            key={model.id} 
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectedModel === model.id 
                                ? "bg-red-500/20 border-red-500/50" 
                                : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                            )}
                            onClick={() => setSelectedModel(model.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3 h-3 text-red-400" />
                                <span className="font-medium text-sm text-white">
                                  {model.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {model.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}