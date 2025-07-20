import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileExplorerProps {
  projectId: number;
  onFileSelect: (file: FileNode) => void;
  selectedFile?: FileNode;
  className?: string;
}

export function FileExplorer({ projectId, onFileSelect, selectedFile, className }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`);
      if (!response.ok) throw new Error('Failed to load files');
      
      const fileData = await response.json();
      const fileTree = buildFileTree(fileData);
      setFiles(fileTree);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildFileTree = (flatFiles: any[]): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    // Sort files by path to ensure directories come before their children
    const sortedFiles = flatFiles.sort((a, b) => a.path.localeCompare(b.path));

    for (const file of sortedFiles) {
      const pathParts = file.path.split('/');
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const isFile = i === pathParts.length - 1;
          const node: FileNode = {
            id: isFile ? file.id : Math.random(),
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            language: file.language,
            content: file.content,
            children: isFile ? undefined : [],
            isExpanded: false,
          };

          pathMap.set(currentPath, node);

          if (parentPath) {
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      }
    }

    return tree;
  };

  const createNewFile = async () => {
    if (!newFileName.trim()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFileName,
          path: newFileName,
          content: '',
          language: getLanguageFromExtension(newFileName),
        }),
      });

      if (!response.ok) throw new Error('Failed to create file');

      const newFile = await response.json();
      setNewFileName('');
      setShowNewFileInput(false);
      loadFiles();
      
      toast({
        title: 'File Created',
        description: `${newFileName} has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating file:', error);
      toast({
        title: 'Error',
        description: 'Failed to create file',
        variant: 'destructive',
      });
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'ps1': 'powershell',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return file.isExpanded ? FolderOpen : Folder;
    }
    return File;
  };

  const toggleFolder = (file: FileNode) => {
    if (file.type === 'folder') {
      setFiles(prevFiles => toggleFolderInTree(prevFiles, file.path));
    }
  };

  const toggleFolderInTree = (tree: FileNode[], targetPath: string): FileNode[] => {
    return tree.map(node => {
      if (node.path === targetPath && node.type === 'folder') {
        return { ...node, isExpanded: !node.isExpanded };
      }
      if (node.children) {
        return { ...node, children: toggleFolderInTree(node.children, targetPath) };
      }
      return node;
    });
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes
      .filter(node => 
        searchQuery === '' || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(node => {
        const Icon = getFileIcon(node);
        const isSelected = selectedFile?.path === node.path;
        
        return (
          <div key={node.path}>
            <div
              className={cn(
                "flex items-center gap-1 py-1 px-2 hover:bg-gray-800/50 cursor-pointer group transition-colors",
                isSelected && "bg-blue-600/20 border-r-2 border-blue-500",
                "text-sm"
              )}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => {
                if (node.type === 'folder') {
                  toggleFolder(node);
                } else {
                  onFileSelect(node);
                }
              }}
            >
              {node.type === 'folder' && (
                <div className="w-4 h-4 flex items-center justify-center">
                  {node.isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              )}
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0",
                node.type === 'folder' ? "text-blue-400" : "text-gray-400"
              )} />
              <span className={cn(
                "truncate flex-1 text-gray-300",
                isSelected && "text-white font-medium"
              )}>
                {node.name}
              </span>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-300"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </div>
            
            {node.type === 'folder' && node.isExpanded && node.children && (
              <div>
                {renderFileTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className={cn("flex flex-col h-full bg-gray-950 border-r border-gray-800", className)}>
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm">Explorer</h3>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewFileInput(true)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadFiles}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 bg-gray-900 border-gray-700 text-xs text-white placeholder-gray-500"
          />
        </div>

        {/* New File Input */}
        {showNewFileInput && (
          <div className="mt-2 space-y-2">
            <Input
              placeholder="Enter file name..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  createNewFile();
                } else if (e.key === 'Escape') {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }
              }}
              className="h-7 bg-gray-900 border-gray-700 text-xs text-white"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={createNewFile}
                className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }}
                className="h-6 text-xs text-gray-400 hover:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <File className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p>No files found</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewFileInput(true)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create your first file
              </Button>
            </div>
          ) : (
            <div className="space-y-px">
              {renderFileTree(files)}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
            >
              <Upload className="w-3 h-3 mr-1" />
              Import
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}