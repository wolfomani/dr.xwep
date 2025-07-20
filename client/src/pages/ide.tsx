import { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { FileExplorer } from '@/components/FileExplorer/FileExplorer';
import { CodeEditor } from '@/components/Monaco/CodeEditor';
import { AIAssistant } from '@/components/AIAssistant/AIAssistant';
import { Terminal } from '@/components/Terminal/Terminal';
import { Button } from '@/components/ui/button';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Code, 
  Settings, 
  User, 
  Globe, 
  X, 
  Play,
  Save,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function IDE() {
  const { 
    activeFile, 
    openFiles, 
    closeFile, 
    saveFile, 
    currentProject, 
    isSaving 
  } = useFileSystem();
  const { isConnected } = useWebSocket();
  const [editorContent, setEditorContent] = useState('');

  const handleSave = () => {
    if (activeFile && editorContent !== activeFile.content) {
      saveFile(editorContent);
    }
  };

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="col-span-3 glassmorphism flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Code className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Code Studio
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{currentProject?.name || 'My Project'}</span>
            {activeFile && (
              <>
                <span className="text-xs">›</span>
                <span>{activeFile.name}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!activeFile || isSaving}
            className="text-gray-400 hover:text-white"
          >
            <Save className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Globe className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* File Explorer */}
      <FileExplorer />

      {/* Editor Area */}
      <main className="bg-gray-900 flex flex-col overflow-hidden">
        {/* Editor Tabs */}
        <div className="bg-gray-800 border-b border-gray-700 flex items-center px-2 min-h-[40px]">
          <div className="flex">
            {openFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center px-4 py-2 border-r border-gray-600 text-sm cursor-pointer transition-colors ${
                  activeFile?.id === file.id 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Code className="w-3 h-3 mr-2 text-blue-400" />
                <span>{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="ml-2 h-4 w-4 p-0 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex">
          {activeFile ? (
            <CodeEditor 
              file={activeFile} 
              onContentChange={handleContentChange}
            />
          ) : (
            <div className="flex-1 bg-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">مرحباً بك في AI Code Studio</h3>
                <p className="text-sm">اختر ملفاً من الشريط الجانبي أو أنشئ ملفاً جديداً للبدء</p>
              </div>
            </div>
          )}
        </div>

        {/* Terminal */}
        <Terminal />
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Status Bar */}
      <footer className="col-span-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6 text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>
              {activeFile ? 
                `${activeFile.language || 'Text'} • ${activeFile.name}` : 
                'No file selected'
              }
            </span>
          </div>
          <span>UTF-8</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>
            AI Models: <span className="text-cyan-400">Active</span>
          </span>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
