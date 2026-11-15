import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { projectsApi } from '../api';
import { useTasks } from './TaskContext';

interface ProjectContextType {
  projects: Project[];
  createProject: (name: string) => Promise<Project>;
  activeProject?: Project;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { activeProjectId } = useTasks();

  const loadProjects = async () => {
    const list = await projectsApi.getProjects();
    setProjects(list);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (name: string) => {
    const created = await projectsApi.createProject(name);
    await loadProjects();
    return created;
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <ProjectContext.Provider value={{ projects, createProject, activeProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};
