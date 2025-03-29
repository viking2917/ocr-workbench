import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton, IonButtons, IonBackButton,
  IonIcon, IonCardHeader, IonCard, IonCardTitle, IonCardContent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonCardSubtitle,
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';
import { imageOutline, scanOutline, saveOutline, closeOutline, text, codeWorking, arrowForward, arrowBack, repeat } from 'ionicons/icons';

import { MarkdownModule } from 'ngx-markdown';

import { Project, Page, applyTextReplacements } from '../../classes/classes';

import { ProjectService } from '../../services/project.service';
import { OcrService } from 'src/app/services/ocr.service';
import { UxToolsService } from 'src/app/services/ux-tools.service';

import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { TextEditorComponent } from 'src/app/components/text-editor/text-editor.component';
import { PromptInputComponent } from 'src/app/components/prompt-input/prompt-input.component';
import { ResizablePanesComponent } from 'src/app/components/resizable-panes/resizable-panes.component';


@Component({
  selector: 'app-page',
  templateUrl: './page.page.html',
  styleUrls: ['./page.page.scss'],
  standalone: true,
  imports: [NgIf, FormsModule,
    IonButton, IonButtons, IonBackButton, IonIcon, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonCardSubtitle,
    IonContent, IonHeader, IonTitle, IonToolbar,
    ImageUploadComponent, TextEditorComponent, PromptInputComponent,
    MarkdownModule, ResizablePanesComponent
  ]
})
export class PagePage {
  filename: string | null = null;
  workingText: string = ''; // what gets fed to the markdown editor
  editedText: string = '';  // what is tracked from when the editor emits changes
  isProcessing = false;
  showPrompt = false;

  // extra prompt: to  Where transcription is low confidence, place the doubtful parts between angle brackets. 
  // Please extract and format the text from this image.';
  // with no additional commentary or explanations

  // Be sure to watch out for 19th century long 's' characters, which looks like an 'f'. make sure to correct those to 's' characters.
  // Correct the spelling of words in the document. Indicate which words are corrected.

  customPrompt = `Transcribe the complete text from this image verbatim.
  preserve bold and italics in the original image, using markdown formatting.
  Merge hyphenated words across line boundaries.
  When a line ends in a hyphen, indicating a word-break, move the fragment to the next line, remove the hyphen, and merge the words.
  Preserve line breaks in the original document when the line does not end with a hyphen.
  Where paragraph breaks occur, insert two newlines into the markdown.
  Change any occurrences of 'ſ', the long s, to the normal 's'.
  Correct the spelling of words containing the letter 'f', as in colonial times, the long s character looks like an f, and, if the correction is spelled differently, place the original word in angle brackets after the correct word. 
  Do not enclose the results in backticks. 
  Output as markdown, preserving bold and italics in the original image.`;
  

  project?: Project;
  page: Page = new Page({});
  pageIndex: number = 0;
  nPages: number = 1;
  projectId: string = '';

  dirty: boolean = false;

  constructor(
    public ux: UxToolsService,

    private ocrService: OcrService,
    // private claudeService: ClaudeService,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {
    addIcons({ text, scanOutline, closeOutline, saveOutline, imageOutline, codeWorking, arrowForward, arrowBack, repeat });
  }

  ionViewWillEnter() {
    this.dirty = false;
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    const pageIndex = this.route.snapshot.paramMap.get('pageIndex');

    if (this.projectId && (this.pageIndex !== null)) {
      this.pageIndex = parseInt(pageIndex || '1') - 1;
      this.getSavedProjectData();
    }
  }

  async goBack() {
    if (!this.dirty) {
      this.ux.goBack();
    } else {
      // this isn't really called, I protect the back button with dirty flag.
      let save = await this.ux.confirm('Edits not saved', `You have edits to your data. If you want to keep 
        them, hit Save Page before going back`, '', `Save`, `Don't Save`);
      if (save) {
        this.saveText();
        this.ux.goBack();
      } else {
        this.ux.goBack();
      }
    }
  }

  async getSavedProjectData() {
    return this.projectService.getProject(this.projectId).subscribe(project => {
      if (project) {
        this.project = project;
        this.page = project.pages[this.pageIndex];
        this.nPages = project.pages.length;
        this.workingText = '';
        setTimeout(() => { this.workingText = this.page.editedText }); //  || this.page.rawText;
      }
    });
  }

  onImageSelected(result: { filename: string, imageData: string }) {
    if (this.page) {
      this.dirty = true;
      this.page.filename = result.filename;
      this.page.imageData = result.imageData;
    }
  }

  onPromptChanged(prompt: string) {
    this.customPrompt = prompt;
  }

  async processImage() {
    if (!this.page.imageData) return;

    let proceed = true;
    if (this.page.editedText) {
      proceed = await this.ux.confirm('Overwrite existing text?', 'You already have text for this page. Do you want to overwrite it?', '', 'Overwrite', 'Cancel');
    }
    if (!proceed) return;

    this.isProcessing = true;
    this.ux.loading('Processing image...');

    try {
      // First, get raw OCR text
      this.workingText = '';
      try {
        this.workingText = await this.ocrService.performOcr(this.page.imageData, this.customPrompt, this.project?.textReplacements);
      } catch (error:any) {
        console.error('Error performing OCR:', error);
        // Handle error with toast or alert
        let errString = error.toString();
        if(errString === 'Error: Failed to process image with Gemini') {
          errString = 'Gemini RECITATION ERROR. See README, and try again later.';
        }
        this.ux.showToast(errString, 2000);
        return;
      }

      // If the OCR service fails, handle it gracefully
      if (!this.workingText) {
        this.workingText = '';
      }

      this.editedText = this.workingText;
      this.dirty = true;

      // Then, process with Claude
      // const processedText = await this.claudeService.processText(rawText, this.customPrompt);
    } catch (error) {
      console.error('Error processing image:', error);
      // Handle error with toast or alert
      this.ux.dismissLoading();
    } finally {
      this.isProcessing = false;
      this.ux.dismissLoading();
    }
  }

  onTextEdited(editedText: string) {
    this.dirty = this.page.editedText !== editedText;
    if (this.editedText !== editedText) {
      this.editedText = editedText;
    }
  }

  saveText() {
    if (!this.editedText) return;

    this.page.editedText = this.editedText;
    if (this.project) {
      this.project.pages[this.pageIndex] = this.page;
      this.projectService.saveProject(this.project).then(() => {
        this.ux.showToast('Page saved');
        this.dirty = false;
      })
    }
  }

  cancelEdits() {
    this.getSavedProjectData();
    this.dirty = false;
  }

  // exportText() {
  //   // const text = this.editableText;
  //   const blob = new Blob([this.page.editedText], { type: 'text/plain' });
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = this.filename + '.md'; // 'ocr-edited-text.txt';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(url);
  // }

  async nextPage(direction = 1 | -1) {
    await this.goBack();

    const totalPages = this.project?.pages.length || 0;
    const newIndex = this.pageIndex + direction;
    // Clamp the page index between 0 and totalPages-1, then add 1 for the URL
    const nextPage = Math.min(Math.max(0, newIndex), totalPages - 1) + 1;

    this.ux.goForward('/tabs/project/' + this.projectId + '/page/' + nextPage);
  }

  applyReplacements(): string {
    if (!this.project) return this.editedText;
    if (!this.workingText) return this.workingText;

    let repl = applyTextReplacements(this.workingText, this.project.textReplacements);
    if (repl) {
      this.dirty = this.workingText !== repl;  // dirty if changed.
      this.workingText = repl;  // update the editor
      this.editedText = this.workingText;
    }

    return this.workingText;
  }

} 