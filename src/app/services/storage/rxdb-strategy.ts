import { StorageStrategy } from 'src/app/services/storage/storage-strategy.interface';
import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';

import { addRxPlugin } from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
addRxPlugin(RxDBMigrationSchemaPlugin);

import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { Projects, Project, Page } from '../../classes/classes';
import { Observable, BehaviorSubject, from, map } from 'rxjs';

export class RxDBStrategy implements StorageStrategy {
  private db!: RxDatabase;
  private projectsCollection!: RxCollection;
  private projectsSubject = new BehaviorSubject<Projects>(new Projects({}));

  // to get back to old data, set version to 0 and remove textReplacements
  private projectSchema = {
    version: 1,
    title: 'project schema',
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 100
      },
      title: { type: 'string' },
      description: { type: 'string' },
      pages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            imageData: { type: 'string' },
            rawText: { type: 'string' },
            editedText: { type: 'string' }
          }
        }
      },
      textReplacements: {
        type: 'array',
        items: {
          type: 'object',
          properties: { 
            original: { type: 'string' },
            replacement: { type: 'string' },
            enabled: { type: 'boolean' }
          }
        }
      } 
    },
    required: ['id', 'title']
  };

  async initialize(): Promise<void> {
    this.db = await createRxDatabase({
      name: 'projectsdb',
      storage: getRxStorageDexie()
    });

    await this.db.addCollections({
      projects: {
        schema: this.projectSchema,
        migrationStrategies: {
          // 1 means, this transforms data from version 0 to version 1
          1: function(oldProject){
            console.log('migrating project from version 0 to version 1');
            oldProject.textReplacements = []; // was missing in v0.
            return oldProject;
          }
        }
      }
    });

    this.projectsCollection = this.db.collections['projects'];
    this.subscribeToChanges();
  }

  private subscribeToChanges() {
    this.projectsCollection.find().$.subscribe(docs => {
      const projects = new Projects({});
      projects.projects = docs.map(doc => {
        return this.projectFromDoc(doc);
      });
      this.projectsSubject.next(projects);
    });
  }

  async createProject(project: Project): Promise<string> {
    const id = crypto.randomUUID();
    project.id = id;
    const doc = {
      // id, // already there.
      ...project
    };

    try {
      await this.projectsCollection.insert(doc);
      return id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  getProjects(): Observable<Projects> {
    return this.projectsSubject.asObservable();
  }

  getProject(id: string): Observable<Project | null> {
    return from(this.projectsCollection.findOne(id).exec()).pipe(
      map(doc => {
        if (!doc) return null;
        else return this.projectFromDoc(doc);
      })
    );
  }

  projectFromDoc(doc: any): Project {
    const project = new Project();
    Object.assign(project, doc.toJSON());

    // reinstantiate to get the class functions back, pages as real objects,not json,
    project.pages = project.pages.map(page => {
      const newPage = new Page({});
      Object.assign(newPage, page);
      return newPage;
    });

    return project;
  }

  async updateProject(id: string, project: Project): Promise<void> {
    try {
      if(!project.id) {
        alert('project has no ID!');
      }
      
      await this.projectsCollection.upsert({
        // id, // already there.
        ...project
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const doc = await this.projectsCollection.findOne(id).exec();
      if (doc) {
        await doc.remove();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async deleteAllProjects(): Promise<void> {
    try {
      await this.projectsCollection.remove();
    } catch (error) {
      console.error('Error deleting all projects:', error);
      throw error;
    }
  }

  async addPage(projectId: string, page: Page): Promise<void> {
    const doc = await this.projectsCollection.findOne(projectId).exec();
    if (!doc) throw new Error('Project not found');

    const project = doc.toJSON();
    project.pages.push(page);
    await this.updateProject(projectId, project);
  }

  async updatePage(projectId: string, pageIndex: number, page: Page): Promise<void> {
    const doc = await this.projectsCollection.findOne(projectId).exec();
    if (!doc) throw new Error('Project not found');

    const project = doc.toJSON();
    project.pages[pageIndex] = page;
    await this.updateProject(projectId, project);
  }

  async deletePage(projectId: string, pageIndex: number): Promise<void> {
    const doc = await this.projectsCollection.findOne(projectId).exec();
    if (!doc) throw new Error('Project not found');

    const project = doc.toJSON();
    project.pages.splice(pageIndex, 1);
    await this.updateProject(projectId, project);
  }

  async saveProject(project: Project): Promise<any> {
    if (!project.id) {
      throw new Error('Project must have an ID to save');
    }
    try {
      return await this.projectsCollection.upsert({
        ...project
      });
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }
} 