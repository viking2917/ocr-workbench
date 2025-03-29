import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons,
  IonList, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, AlertController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';

import { Project, Projects } from 'src/app/classes/classes';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonList, 
    IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel,
    NgIf, NgFor]
})

export class ProjectsPage {
  projects: Projects = new Projects({});

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ add, trash });
  }

  ionViewWillEnter() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe(projects => {
      console.log('loaded Projects', projects);
      this.projects = projects;
    });
  }

  selectProject(projectId: string) {
    this.router.navigate(['/tabs/project', projectId]);
  }

  async addProject() {
    const alert = await this.alertController.create({
      header: 'New Project',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Project Title'
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Project Description'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: async (data) => {
            if (data.title.trim() !== '') {
              const newProject = new Project();
              newProject.title = data.title;
              newProject.description = data.description || '';
              await this.projectService.createProject(newProject);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProject(event: Event, projectId: string) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this project?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.projectService.deleteProject(projectId);
          }
        }
      ]
    });

    await alert.present();
  }
}