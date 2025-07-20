import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { initializeMonaco, getLanguageFromExtension } from '@/lib/monacoSetup';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { File } from '@shared/schema';

interface CodeEditorProps {
  file: File | null;
  onContentChange?: (content: string) => void;
}

export const CodeEditor = ({ file, onContentChange }: CodeEditorProps) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { sendMessageNoResponse } = useWebSocket();

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      // Initialize Monaco
      initializeMonaco();

      // Create editor
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: '',
        language: 'javascript',
        theme: 'ai-dark',
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        automaticLayout: true,
        minimap: { enabled: true },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        wordWrap: 'on',
        folding: true,
        lineDecorationsWidth: 20,
        lineNumbersMinChars: 3,
        glyphMargin: true,
        contextmenu: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        renderLineHighlight: 'gutter',
        selectOnLineNumbers: true,
        renderWhitespace: 'selection',
        bracketPairColorization: {
          enabled: true,
        },
      });

      // Add content change listener
      editorRef.current.onDidChangeModelContent(() => {
        const content = editorRef.current?.getValue() || '';
        onContentChange?.(content);
        
        // Send real-time updates via WebSocket
        if (file) {
          sendMessageNoResponse({
            type: 'file_update',
            fileId: file.id,
            content
          });
        }
      });

      setIsReady(true);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
        setIsReady(false);
      }
    };
  }, []);

  // Update editor content when file changes
  useEffect(() => {
    if (editorRef.current && file) {
      const language = getLanguageFromExtension(file.name);
      const model = monaco.editor.createModel(file.content || '', language);
      editorRef.current.setModel(model);
    }
  }, [file]);

  if (!isReady) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
