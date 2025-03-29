import { Injectable } from '@angular/core';
import { Projects, Project, Page } from '../classes/classes';
import { Observable } from 'rxjs';
import { StorageStrategy } from 'src/app/services/storage/storage-strategy.interface';
import { FirestoreStrategy } from './storage/firestore-strategy';
import { RxDBStrategy } from 'src/app/services/storage/rxdb-strategy';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  projects: Projects = new Projects({});
  public initialized = false;
  private storageStrategy: StorageStrategy;
  private currentStrategy: 'firestore' | 'rxdb' = 'rxdb';

  constructor() {
    // Default to RxDB
    this.storageStrategy = new RxDBStrategy();
    this.storageStrategy.initialize().then(() => {
      this.initialized = true;
    });
  }

  async setStorageStrategy(type: 'firestore' | 'rxdb'): Promise<void> {
    if (this.currentStrategy === type) return;
    
    this.currentStrategy = type;
    this.storageStrategy = type === 'firestore' 
      ? new FirestoreStrategy()
      : new RxDBStrategy();
    
    await this.storageStrategy.initialize();
  }

  async createProject(project: Project): Promise<string> {
    return this.storageStrategy.createProject(project);
  }

  getProjects(): Observable<Projects> {
    return this.storageStrategy.getProjects();
  }

  getProject(id: string): Observable<Project | null> {
    if(!id || !this.storageStrategy) {
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
    return this.storageStrategy.getProject(id);
  }

  async saveProject(project: Project): Promise<any> {
    return this.storageStrategy.saveProject(project);
  }
  async updateProject(id: string, project: Project): Promise<void> {
    return this.storageStrategy.updateProject(id, project);
  }

  async deleteProject(id: string): Promise<void> {
    return this.storageStrategy.deleteProject(id);
  }

  async deleteAllProjects(): Promise<void> {
    return this.storageStrategy.deleteAllProjects();
  }

  async addPage(projectId: string, page: Page): Promise<void> {
    return this.storageStrategy.addPage(projectId, page);
  }

  async updatePage(projectId: string, pageIndex: number, page: Page): Promise<void> {
    return this.storageStrategy.updatePage(projectId, pageIndex, page);
  }

  async deletePage(projectId: string, pageIndex: number): Promise<void> {
    return this.storageStrategy.deletePage(projectId, pageIndex);
  }
} 