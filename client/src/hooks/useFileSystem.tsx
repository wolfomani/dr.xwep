import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { File, Project } from '@shared/schema';

export const useFileSystem = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Fetch files for current project
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'files'],
    enabled: !!currentProject?.id,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description?: string }) => {
      const response = await apiRequest('POST', '/api/projects', projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async (fileData: { name: string; path: string; content?: string; language?: string }) => {
      if (!currentProject) throw new Error('No current project');
      const response = await apiRequest('POST', `/api/projects/${currentProject.id}/files`, fileData);
      return response.json();
    },
    onSuccess: () => {
      if (currentProject) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject.id, 'files'] });
      }
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: number; content: string }) => {
      const response = await apiRequest('PUT', `/api/files/${fileId}`, { content });
      return response.json();
    },
    onSuccess: (updatedFile) => {
      // Update local state
      setActiveFile(updatedFile);
      setOpenFiles(prev => prev.map(file => file.id === updatedFile.id ? updatedFile : file));
      
      if (currentProject) {
        queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject.id, 'files'] });
      }
    },
  });

  // File management functions
  const openFile = (file: File) => {
    setActiveFile(file);
    setOpenFiles(prev => {
      if (prev.some(f => f.id === file.id)) {
        return prev;
      }
      return [...prev, file];
    });
  };

  const closeFile = (fileId: number) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFile?.id === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
    }
  };

  const saveFile = (content: string) => {
    if (!activeFile) return;
    updateFileMutation.mutate({ fileId: activeFile.id, content });
  };

  const createProject = (projectData: { name: string; description?: string }) => {
    return createProjectMutation.mutateAsync(projectData);
  };

  const createFile = (fileData: { name: string; path: string; content?: string; language?: string }) => {
    return createFileMutation.mutateAsync(fileData);
  };

  // Initialize with first project if available
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject]);

  return {
    // State
    currentProject,
    activeFile,
    openFiles,
    projects,
    files,
    
    // Loading states
    projectsLoading,
    filesLoading,
    isCreatingProject: createProjectMutation.isPending,
    isCreatingFile: createFileMutation.isPending,
    isSaving: updateFileMutation.isPending,
    
    // Actions
    setCurrentProject,
    openFile,
    closeFile,
    saveFile,
    createProject,
    createFile,
  };
};
