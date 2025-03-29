import { Observable } from 'rxjs';
import { Projects, Project, Page } from '../../classes/classes';

export interface StorageStrategy {
  initialize(): Promise<void>;
  createProject(project: Project): Promise<string>;
  saveProject(project: Project): Promise<void>;
  getProjects(): Observable<Projects>;
  getProject(id: string): Observable<Project | null>;
  updateProject(id: string, project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  deleteAllProjects(): Promise<void>;
  addPage(projectId: string, page: Page): Promise<void>;
  updatePage(projectId: string, pageIndex: number, page: Page): Promise<void>;
  deletePage(projectId: string, pageIndex: number): Promise<void>;
} 