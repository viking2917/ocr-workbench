import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem,
  IonIcon, IonButton, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonText, IonInput, IonToggle,
  IonGrid, IonRow, IonCol, AlertController
 } from '@ionic/angular/standalone';

// import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { documentText, personCircle, search, pencilOutline, documentTextOutline, trash, add, swapHorizontal } from 'ionicons/icons';

import JSZip from 'jszip';

import { Project, Page } from '../../classes/classes';

import { ProjectService } from '../../services/project.service';
import { DirectoryImagePickerComponent } from 'src/app/components/directory-image-picker/directory-image-picker.component';
import { TextUtilsService } from 'src/app/services/text-utils.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  standalone: true,
  imports: [
    NgIf, FormsModule,
    IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonCardTitle, IonCardHeader,
    IonText, IonGrid, IonRow, IonCol, IonList, IonItem, IonInput, IonToggle, DirectoryImagePickerComponent,
  ]
})
export class ProjectPage {
  imageFiles: string[] = [];
  project: Project = new Project();
  showReplacements: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private alertController: AlertController,
    private textUtils: TextUtilsService,
  ) {
    addIcons({ documentTextOutline, pencilOutline, trash, add, documentText, personCircle, search, swapHorizontal });
  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.projectService.initialized) {
      this.projectService.getProject(id).subscribe(project => {
        if (project) {
          this.project = project;
        }
      });
    }
  }

  handleImagesSelected(pages: Page[]) {
    console.log('Selected images:', pages);
    // Do something with the images

    this.project.pages = pages;

    this.projectService.saveProject(this.project).then(result => {
      console.log('saved', result);
    });
  }

  openPage(index: number) {
    // Navigate to tab1 with image data from the selected page
    if (this.project?.pages[index]) {
      this.router.navigate(['/tabs/project', this.project.id, 'page', index + 1], {
        state: { imageData: this.project.pages[index].imageData }
      });
      return;
    }
  }

  async exportText() {
    // Check if there are any pages with edited text
    if (!this.project.pages.length) {
      const alert = await this.alertController.create({
        header: 'No Content',
        message: 'There are no pages to export.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Ask user for all export preferences at once
    const alert = await this.alertController.create({
      header: 'Export Text',
      message: 'Choose your export preferences:',
      inputs: [
        {
          type: 'radio',
          label: 'Single File - Markdown',
          value: 'single-md',
          name: 'export-type'
        },
        {
          type: 'radio',
          label: 'Single File - HTML',
          value: 'single-html',
          name: 'export-type'
        },
        {
          type: 'radio',
          label: 'Multiple Files - Markdown',
          value: 'multiple-md',
          name: 'export-type'
        },
        {
          type: 'radio',
          label: 'Multiple Files - HTML',
          value: 'multiple-html',
          name: 'export-type'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Export',
          handler: (value) => this.performExport(value)
        }
      ]
    });

    await alert.present();
  }

  private async performExport(exportType: string) {
    // Combine all edited text if single file
    const allText = exportType.startsWith('single') ?
      this.project.pages
        .map(page => page.editedText)
        .join('\n\n--- Page Break ---\n\n') :
      null;

    switch (exportType) {
      case 'single-md':
        await this.exportSingleFile(allText!, 'markdown');
        break;
      case 'single-html':
        await this.exportSingleFile(allText!, 'html');
        break;
      case 'multiple-md':
        await this.exportMultipleFiles(this.project.pages, 'markdown');
        break;
      case 'multiple-html':
        await this.exportMultipleFiles(this.project.pages, 'html');
        break;
    }
  }

  private async exportSingleFile(text: string, format: 'markdown' | 'html') {
    let content: string;
    let fileExtension: string;
    let mimeType: string;

    if (format === 'html') {
      content = await this.textUtils.markdownToHtml(text);
      fileExtension = 'html';
      mimeType = 'text/html';
    } else {
      content = text;
      fileExtension = 'md';
      mimeType = 'text/markdown';
    }

    console.log('exporting', content);

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private async exportMultipleFiles(pages: Page[], format: 'markdown' | 'html') {
    const zip = new JSZip();

    for (const [index, page] of pages.entries()) {
      if (page.editedText) {
        let content: string;
        let fileExtension: string;

        if (format === 'html') {
          content = await this.textUtils.markdownToHtml(page.editedText);
          fileExtension = 'html';
        } else {
          content = page.editedText;
          fileExtension = 'md';
        }

        console.log('exporting', content);
        const filename = page.filename ?
          `${page.filename}.${fileExtension}` :
          `page_${index + 1}.${fileExtension}`;

        zip.file(filename, content);
      }
    }


    // Generate and download the zip file
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.project.title || 'project'}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async editDetails() {
    const alert = await this.alertController.create({
      header: 'Edit Project',
      inputs: [{
        name: 'title',
        type: 'text',
        value: this.project.title,
        placeholder: this.project.title
      },
      {
        name: 'description',
        type: 'textarea',
        value: this.project.description,
        placeholder: this.project.description || 'description'
      }
      ],
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Update',
        handler: async (data) => {
          if (data.title.trim() !== '') {
            this.project.title = data.title;
            this.project.description = data.description || '';
            await this.projectService.saveProject(this.project);
          }
        }
      }
      ]
    });

    await alert.present();
  }

  addReplacement() {
    if (!this.project.textReplacements) {
      this.project.textReplacements = [];
    }
    this.project.textReplacements.push({
      original: '',
      replacement: '',
      enabled: true
    });
  }

  removeReplacement(index: number) {
    this.project.textReplacements.splice(index, 1);
    this.projectService.saveProject(this.project).then(result => {
      console.log('saved', result);
    });
  }
}
