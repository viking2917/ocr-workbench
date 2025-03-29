/* NOTE ALL OF THIS IS UNTESTED AND PROBABLY DOES NOT WORK */
// AI Generated Code

import { StorageStrategy } from 'src/app/services/storage/storage-strategy.interface';
import { Projects, Project, Page } from '../../classes/classes';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  collectionData,
  docData,
  getDocs,
  writeBatch
} from '@angular/fire/firestore';
import { inject } from '@angular/core';

export class FirestoreStrategy implements StorageStrategy {
  private firestore: Firestore = inject(Firestore);
  private projectsSubject = new BehaviorSubject<Projects>(new Projects({}));

  async initialize(): Promise<void> {
    const projectsCollection = collection(this.firestore, 'projects');
    collectionData(projectsCollection, { idField: 'id' }).subscribe(projects => {
      const projectsList = new Projects({});
      projectsList.projects = projects.map(p => {
        const project = new Project();
        Object.assign(project, p);
        return project;
      });
      this.projectsSubject.next(projectsList);
    });
  }

  async createProject(project: Project): Promise<string> {
    const projectsCollection = collection(this.firestore, 'projects');
    const docRef = await addDoc(projectsCollection, {
      title: project.title,
      description: project.description,
      pages: project.pages || []
    });
    return docRef.id;
  }

  getProjects(): Observable<Projects> {
    return this.projectsSubject.asObservable();
  }

  getProject(id: string): Observable<Project | null> {
    const projectDoc = doc(this.firestore, 'projects', id);
    return docData(projectDoc, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const project = new Project();
        Object.assign(project, data);
        return project;
      })
    );
  }

  async updateProject(id: string, project: Project): Promise<void> {
    const projectDoc = doc(this.firestore, 'projects', id);
    await updateDoc(projectDoc, {
      title: project.title,
      description: project.description,
      pages: project.pages
    });
  }

  async deleteProject(id: string): Promise<void> {
    const projectDoc = doc(this.firestore, 'projects', id);
    await deleteDoc(projectDoc);
  }

  async deleteAllProjects(): Promise<void> {
    const projectsCollection = collection(this.firestore, 'projects');
    const snapshot = await getDocs(projectsCollection);
    const batch = writeBatch(this.firestore);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  async addPage(projectId: string, page: Page): Promise<void> {
    const projectDoc = doc(this.firestore, 'projects', projectId);
    const project = await docData(projectDoc, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const project = new Project();
        Object.assign(project, data);
        return project;
      })
    ).toPromise();

    if (!project) throw new Error('Project not found');
    
    project.pages.push(page);
    await this.updateProject(projectId, project);
  }

  async updatePage(projectId: string, pageIndex: number, page: Page): Promise<void> {
    const projectDoc = doc(this.firestore, 'projects', projectId);
    const project = await docData(projectDoc, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const project = new Project();
        Object.assign(project, data);
        return project;
      })
    ).toPromise();

    if (!project) throw new Error('Project not found');
    
    project.pages[pageIndex] = page;
    await this.updateProject(projectId, project);
  }

  async deletePage(projectId: string, pageIndex: number): Promise<void> {
    const projectDoc = doc(this.firestore, 'projects', projectId);
    const project = await docData(projectDoc, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const project = new Project();
        Object.assign(project, data);
        return project;
      })
    ).toPromise();

    if (!project) throw new Error('Project not found');
    
    project.pages.splice(pageIndex, 1);
    await this.updateProject(projectId, project);
  }

  async saveProject(project: Project): Promise<void> {
    if (!project.id) {
      throw new Error('Project must have an ID to save');
    }
    try {
      const projectDoc = doc(this.firestore, 'projects', project.id);
      await updateDoc(projectDoc, { ...project });
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }
} 