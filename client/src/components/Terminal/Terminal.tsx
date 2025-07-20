import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Terminal as TerminalIcon, Play, Square, Trash2, Settings, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  className?: string;
  currentCode?: string;
  currentLanguage?: string;
}

export function Terminal({ className, currentCode, currentLanguage }: TerminalProps) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([
    {
      id: '1',
      type: 'system',
      content: 'DRX AI Hub Terminal v1.0 - Ready to execute code',
      timestamp: new Date(),
    }
  ]);
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('~/workspace');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-scroll to bottom when new output arrives
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [outputs]);

  useEffect(() => {
    // Focus input when terminal is mounted
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addOutput = (type: TerminalOutput['type'], content: string) => {
    const newOutput: TerminalOutput = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setOutputs(prev => [...prev, newOutput]);
  };

  const executeCommand = async () => {
    if (!command.trim() || isRunning) return;

    const currentCommand = command.trim();
    setCommand('');
    
    // Add command to output
    addOutput('input', `${currentDirectory} $ ${currentCommand}`);
    setIsRunning(true);

    try {
      if (currentCommand.startsWith('run') || currentCommand === 'execute') {
        // Execute current code
        await executeCode();
      } else if (currentCommand === 'clear') {
        // Clear terminal
        setOutputs([{
          id: Date.now().toString(),
          type: 'system',
          content: 'Terminal cleared',
          timestamp: new Date(),
        }]);
      } else if (currentCommand.startsWith('cd ')) {
        // Change directory (simulated)
        const newDir = currentCommand.substring(3).trim();
        setCurrentDirectory(newDir || '~/workspace');
        addOutput('system', `Changed directory to ${newDir || '~/workspace'}`);
      } else if (currentCommand === 'ls' || currentCommand === 'dir') {
        // List directory (simulated)
        addOutput('output', 'main.py\nutils.js\nconfig.json\nREADME.md');
      } else if (currentCommand === 'pwd') {
        // Print working directory
        addOutput('output', currentDirectory);
      } else if (currentCommand.startsWith('echo ')) {
        // Echo command
        const text = currentCommand.substring(5);
        addOutput('output', text);
      } else if (currentCommand === 'help') {
        // Show help
        addOutput('system', `Available commands:
run / execute - Run current code
clear - Clear terminal
cd <directory> - Change directory
ls / dir - List files
pwd - Print working directory
echo <text> - Print text
help - Show this help message

Language-specific execution:
Python: python main.py
Node.js: node index.js
Java: javac Main.java && java Main`);
      } else {
        // Try to execute as system command
        await executeSystemCommand(currentCommand);
      }
    } catch (error) {
      addOutput('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const executeCode = async () => {
    if (!currentCode) {
      addOutput('error', 'No code to execute. Please write some code in the editor first.');
      return;
    }

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentCode,
          language: currentLanguage || 'javascript',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const result = await response.json();
      
      if (result.output) {
        addOutput('output', result.output);
      }
      
      if (result.error) {
        addOutput('error', result.error);
      }

      if (!result.output && !result.error) {
        addOutput('system', 'Code executed successfully (no output)');
      }

    } catch (error) {
      console.error('Execution error:', error);
      addOutput('error', `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const executeSystemCommand = async (cmd: string) => {
    // Simulate system command execution
    const command = cmd.toLowerCase();
    
    if (command.includes('python')) {
      addOutput('output', 'Python 3.9.7 (default, Oct 10 2021, 15:13:22)');
    } else if (command.includes('node')) {
      addOutput('output', 'v18.17.0');
    } else if (command.includes('npm')) {
      addOutput('output', '9.8.1');
    } else if (command.includes('git')) {
      addOutput('output', 'git version 2.34.1');
    } else {
      addOutput('error', `Command not found: ${cmd}`);
    }
  };

  const runCurrentCode = () => {
    setCommand('run');
    executeCommand();
  };

  const clearTerminal = () => {
    setOutputs([{
      id: Date.now().toString(),
      type: 'system',
      content: 'Terminal cleared',
      timestamp: new Date(),
    }]);
  };

  const exportLogs = () => {
    const logData = {
      outputs,
      exportedAt: new Date().toISOString(),
      currentDirectory,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Logs Exported',
      description: 'Terminal logs have been downloaded',
    });
  };

  const getOutputStyle = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'input':
        return 'text-blue-300';
      case 'output':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'system':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  const getPrompt = () => {
    return `${currentDirectory} $ `;
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-950 border border-gray-800 rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <h3 className="font-semibold text-white text-sm">Terminal</h3>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
            {isRunning ? 'Running' : 'Ready'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {currentCode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={runCurrentCode}
              disabled={isRunning}
              className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-400/10"
            >
              <Play className="w-3 h-3 mr-1" />
              Run Code
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={clearTerminal}
            className="h-7 px-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={exportLogs}
            className="h-7 px-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
          >
            <Download className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="font-mono text-sm space-y-1">
          {outputs.map((output) => (
            <div key={output.id} className="flex">
              <span className={cn("whitespace-pre-wrap", getOutputStyle(output.type))}>
                {output.content}
              </span>
            </div>
          ))}
          
          {/* Current input line */}
          <div className="flex items-center">
            <span className="text-blue-300 font-mono text-sm mr-1">
              {getPrompt()}
            </span>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  executeCommand();
                }
              }}
              disabled={isRunning}
              className="flex-1 bg-transparent border-none p-0 text-white font-mono text-sm focus:ring-0 focus:outline-none"
              placeholder={isRunning ? "Executing..." : "Type a command..."}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-900/30 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{currentDirectory}</span>
          {currentLanguage && (
            <span className="capitalize">{currentLanguage}</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span>Lines: {outputs.length}</span>
          <span className={isRunning ? "text-yellow-400" : "text-green-400"}>
            {isRunning ? "Running" : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}