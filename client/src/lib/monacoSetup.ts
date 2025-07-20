import * as monaco from 'monaco-editor';

export const initializeMonaco = () => {
  // Configure Monaco themes
  monaco.editor.defineTheme('ai-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'F97583' },
      { token: 'string', foreground: '9ECBFF' },
      { token: 'number', foreground: '79B8FF' },
      { token: 'type', foreground: 'B392F0' },
      { token: 'function', foreground: 'B392F0' },
      { token: 'variable', foreground: 'E1E4E8' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e1e4e8',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#f0f6fc',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorCursor.foreground': '#00d4ff',
    }
  });

  // Set default theme
  monaco.editor.setTheme('ai-dark');

  // Configure language features
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  });

  return monaco;
};

export const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'jsx': return 'javascriptreact';
    case 'tsx': return 'typescriptreact';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': case 'cxx': case 'cc': return 'cpp';
    case 'c': return 'c';
    case 'cs': return 'csharp';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'swift': return 'swift';
    case 'kt': return 'kotlin';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'scss': return 'scss';
    case 'json': return 'json';
    case 'xml': return 'xml';
    case 'md': return 'markdown';
    case 'sql': return 'sql';
    case 'sh': return 'shell';
    case 'yml': case 'yaml': return 'yaml';
    default: return 'plaintext';
  }
};
