import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MonacoEditor } from '@/components/MonacoEditor/MonacoEditor';
import { FileExplorer } from '@/components/FileExplorer/FileExplorer';
import { AIChat } from '@/components/AIChat/AIChat';
import { Terminal } from '@/components/Terminal/Terminal';
import { 
  Code, 
  FileText, 
  Bot, 
  Terminal as TerminalIcon, 
  Settings, 
  Play, 
  Save,
  Maximize2,
  Minimize2,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import logoUrl from '@assets/drx-logo_1752989300116.png';

interface FileNode {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

export function DrxIdeMain() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to load projects');
      
      const projects = await response.json();
      if (projects.length > 0) {
        setCurrentProject(projects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المشاريع',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    setCode(file.content || '');
    setLanguage(file.language || 'javascript');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/api/files/${selectedFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: code,
        }),
      });

      if (!response.ok) throw new Error('Failed to save file');

      toast({
        title: 'تم الحفظ',
        description: `تم حفظ ${selectedFile.name} بنجاح`,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الملف',
        variant: 'destructive',
      });
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: 'تحذير',
        description: 'لا يوجد كود لتنفيذه',
        variant: 'destructive',
      });
      return;
    }

    // The terminal component will handle execution
    toast({
      title: 'تشغيل الكود',
      description: 'جاري تنفيذ الكود في الطرفية...',
    });
  };

  const handleCodeInsert = (insertedCode: string) => {
    setCode(insertedCode);
    toast({
      title: 'تم إدراج الكود',
      description: 'تم إدراج الكود من مساعد AI',
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="DRX Logo" className="w-6 h-6" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              DRX AI Hub
            </h1>
            <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
              v1.0
            </Badge>
          </div>
          
          {currentProject && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Separator orientation="vertical" className="h-4" />
              <span>{currentProject.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            <PanelRightOpen className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-4" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={!selectedFile}
            className="h-8 px-3 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
          >
            <Save className="w-4 h-4 mr-1" />
            حفظ
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRun}
            disabled={!code.trim()}
            className="h-8 px-3 text-green-400 hover:text-green-300 hover:bg-green-400/10"
          >
            <Play className="w-4 h-4 mr-1" />
            تشغيل
          </Button>

          <Separator orientation="vertical" className="h-4" />

          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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

      {/* Main Content */}
      <div className="h-[calc(100vh-3rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - File Explorer */}
          {showLeftPanel && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full">
                  <FileExplorer
                    projectId={currentProject?.id || 1}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    className="h-full"
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Main Editor Area */}
          <ResizablePanel defaultSize={showLeftPanel && showRightPanel ? 50 : 70}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Code Editor */}
              <ResizablePanel defaultSize={showBottomPanel ? 70 : 100} minSize={30}>
                <div className="h-full bg-gray-950">
                  {selectedFile ? (
                    <MonacoEditor
                      value={code}
                      onChange={handleCodeChange}
                      language={language}
                      onSave={handleSave}
                      onRun={handleRun}
                      className="h-full"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-950/50">
                      <div className="text-center">
                        <Code className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                          أهلاً بك في DRX AI Hub
                        </h3>
                        <p className="text-gray-500 max-w-md">
                          اختر ملفاً من المستكشف أو أنشئ ملفاً جديداً لبدء البرمجة مع مساعدة الذكاء الاصطناعي
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-400">مدعوم بـ DeepSeek و Groq</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Bottom Panel - Terminal */}
              {showBottomPanel && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                    <div className="h-full p-2">
                      <Terminal
                        currentCode={code}
                        currentLanguage={language}
                        className="h-full"
                      />
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right Sidebar - AI Chat */}
          {showRightPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
                <div className="h-full p-2">
                  <AIChat
                    currentCode={code}
                    currentLanguage={language}
                    onCodeInsert={handleCodeInsert}
                    className="h-full"
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>متصل</span>
          </div>
          {selectedFile && (
            <>
              <span>{selectedFile.name}</span>
              <span className="capitalize">{language}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>DRX AI Hub</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400">AI نشط</span>
          </div>
        </div>
      </div>
    </div>
  );
}