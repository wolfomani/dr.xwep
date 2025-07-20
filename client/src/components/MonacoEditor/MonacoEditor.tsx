import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Play, Save, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
  readOnly?: boolean;
  className?: string;
  onSave?: () => void;
  onRun?: () => void;
}

export function MonacoEditor({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  readOnly = false,
  className,
  onSave,
  onRun
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (editorRef.current && !monacoInstanceRef.current) {
      // Configure Monaco Editor
      monaco.editor.defineTheme('drx-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'regexp', foreground: 'D16969' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'class', foreground: '4EC9B0' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'constant', foreground: '4FC1FF' },
          { token: 'operator', foreground: 'D4D4D4' },
        ],
        colors: {
          'editor.background': '#0d1117',
          'editor.foreground': '#e6edf3',
          'editor.lineHighlightBackground': '#21262d',
          'editor.selectionBackground': '#264f78',
          'editor.cursor': '#7c3aed',
          'editorLineNumber.foreground': '#7d8590',
          'editorLineNumber.activeForeground': '#e6edf3',
          'editor.selectionHighlightBackground': '#3d444d',
          'editor.wordHighlightBackground': '#3d444d',
          'editor.findMatchBackground': '#ffd700',
          'editor.findMatchHighlightBackground': '#ea6962',
          'editorBracketMatch.background': '#3d444d',
          'editorBracketMatch.border': '#7c3aed',
        }
      });

      // Create editor instance
      const editor = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: 'drx-dark',
        readOnly,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
        lineHeight: 1.6,
        letterSpacing: 0.5,
        wordWrap: 'on',
        contextmenu: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        unfoldOnClickAfterEndOfLine: true,
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        roundedSelection: false,
        renderIndentGuides: true,
        cursorSmoothCaretAnimation: "on",
        cursorBlinking: 'smooth',
        mouseWheelZoom: true,
        multiCursorModifier: 'ctrlCmd',
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        trimAutoWhitespace: true,
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        suggest: {
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showWords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showSnippets: true,
        },
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
        parameterHints: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoSurround: 'languageDefined',
        codeLens: true,
        colorDecorators: true,
        links: true,
        find: {
          addExtraSpaceOnTop: true,
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'always',
        },
      });

      monacoInstanceRef.current = editor;

      // Set up event listeners
      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      // Keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun?.();
      });

      setIsReady(true);
    }

    return () => {
      if (monacoInstanceRef.current) {
        monacoInstanceRef.current.dispose();
        monacoInstanceRef.current = null;
        setIsReady(false);
      }
    };
  }, []);

  useEffect(() => {
    if (monacoInstanceRef.current && value !== monacoInstanceRef.current.getValue()) {
      monacoInstanceRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoInstanceRef.current) {
      monaco.editor.setModelLanguage(monacoInstanceRef.current.getModel()!, language);
    }
  }, [language]);

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      scss: 'scss',
      less: 'less',
      json: 'json',
      yaml: 'yaml',
      xml: 'xml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      powershell: 'ps1',
      dockerfile: 'dockerfile',
    };
    return extensions[lang] || 'txt';
  };

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-900/50 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">
            {language.toUpperCase()}
          </span>
          <div className="w-1 h-1 rounded-full bg-green-500"></div>
          <span className="text-xs text-green-400">Ready</span>
        </div>
        
        <div className="flex items-center gap-1">
          {onRun && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRun}
              className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-400/10"
            >
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
          )}
          
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSave}
              className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-7 px-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
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

      {/* Monaco Editor Container */}
      <div 
        ref={editorRef} 
        className="flex-1 min-h-0"
        style={{ height: '100%' }}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-900/30 border-t border-gray-800 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Ln {monacoInstanceRef.current?.getPosition()?.lineNumber || 1}, Col {monacoInstanceRef.current?.getPosition()?.column || 1}</span>
          <span>UTF-8</span>
          <span>{language}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Spaces: 2</span>
          <span className={isReady ? "text-green-400" : "text-yellow-400"}>
            {isReady ? "Ready" : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}