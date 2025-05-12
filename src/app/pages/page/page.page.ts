import { Component, HostListener, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton, IonButtons, IonBackButton,
  IonIcon, IonCardHeader, IonCard, IonCardTitle, IonCardContent,
  IonContent, IonHeader, IonTitle, IonToolbar, IonCardSubtitle,
  IonRange, IonItem, IonLabel
} from '@ionic/angular/standalone';


import { addIcons } from 'ionicons';
import { imageOutline, scanOutline, saveOutline, closeOutline, text, codeWorking, caretDown, arrowForward, arrowBack, repeat, search, homeOutline } from 'ionicons/icons';

import { MarkdownModule } from 'ngx-markdown';

import { Project, Page, applyTextReplacements, deHyphenString } from '../../classes/classes';

import { ProjectService } from '../../services/project.service';
import { OcrService } from 'src/app/services/ocr.service';
import { UxToolsService } from 'src/app/services/ux-tools.service';

import { ImageUploadComponent } from 'src/app/components/image-upload/image-upload.component';
import { TextEditorComponent } from 'src/app/components/text-editor/text-editor.component';
import { PromptInputComponent } from 'src/app/components/prompt-input/prompt-input.component';
import { ResizablePanesComponent } from 'src/app/components/resizable-panes/resizable-panes.component';
import { FindReplaceModalComponent } from 'src/app/components/find-replace-modal/find-replace-modal.component';


@Component({
  selector: 'app-page',
  templateUrl: './page.page.html',
  styleUrls: ['./page.page.scss'],
  standalone: true,
  imports: [NgIf, FormsModule,
    IonButton, IonButtons, IonBackButton, IonIcon, IonCardHeader, IonCard, IonCardTitle, IonCardContent, IonCardSubtitle,
    IonContent, IonHeader, IonTitle, IonToolbar,
    ImageUploadComponent, TextEditorComponent, PromptInputComponent,
    MarkdownModule, ResizablePanesComponent, FindReplaceModalComponent,
    IonRange, IonItem, IonLabel
  ]
})
export class PagePage {
  @ViewChild('textEditor') textEditor?: TextEditorComponent;
  
  filename: string | null = null;
  workingText: string = ''; // what gets fed to the markdown editor
  editedText: string = '';  // what is tracked from when the editor emits changes
  isProcessing = false;
  showPrompt = false;
  showTextControls = false;
  showFindReplaceModal = false;

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

  // Add new properties for text controls
  lineHeight: number = 1.2;  // default value
  fontSize: number = 16;     // default value

  constructor(
    public ux: UxToolsService,

    private ocrService: OcrService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router
  ) {
    addIcons({ text, scanOutline, closeOutline, saveOutline, imageOutline, codeWorking, caretDown, arrowForward, arrowBack, repeat, search, homeOutline });
  }

  ionViewWillEnter() {
    this.dirty = false;
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    const pageIndex = this.route.snapshot.paramMap.get('pageIndex');

    if (this.projectId && (this.pageIndex !== null)) {
      this.pageIndex = parseInt(pageIndex || '1') - 1;
      this.getSavedProjectData();
    }

    // Initialize text control values from CSS variables or defaults
    const styles = getComputedStyle(document.documentElement);
    this.lineHeight = parseFloat(styles.getPropertyValue('--text-line-height')); //  || 1.5;
    this.fontSize = parseInt(styles.getPropertyValue('--text-font-size').replace("px", "")); //  || 16;
  }

  async goBack() {
    if (!this.dirty) {
      this.ux.goBack();
    } else {
      // this isn't really called, I protect the back button with dirty flag.
      let save = await this.ux.confirm('Edits not saved', `You have edits to your data. If you want to keep 
        them, hit Save Page before going back`, '', `Save`, `Don't Save`);
      if (save) {
        await this.saveText();
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
        this.nPages = project.pages.length;
        this.setPage(this.pageIndex);
      }
    });
  }

  setPage(pageIndex: number) {
    if (this.project) {
      this.pageIndex = pageIndex;
      this.page = this.project.pages[this.pageIndex];
      this.workingText = '';
      setTimeout(() => {
        this.workingText = this.page.editedText
      }); //  || this.page.rawText;
    }
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
      console.log('text changed', this.editedText);
    }
  }

  async saveText() {
    if (!this.editedText) return;

    this.page.editedText = this.editedText;
    if (this.project) {
      this.project.pages[this.pageIndex] = this.page;
      await this.projectService.saveProject(this.project).then(() => {
        this.ux.showToast('Page saved');
        this.dirty = false;
      });
      return true
    } else {
      return false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    
    const isDesktop= this.ux.isDesktop();

    const isSaveShortcut = (isDesktop && event.metaKey && event.key === 's') ||
                           (!isDesktop && event.ctrlKey && event.key === 's');

    const isNextPageShortcut = (isDesktop && event.metaKey && event.key === 'ArrowRight') ||
                              (!isDesktop && event.ctrlKey && event.key === 'ArrowRight');
    const isPrevPageShortcut = (isDesktop && event.metaKey && event.key === 'ArrowLeft') ||
                              (!isDesktop && event.ctrlKey && event.key === 'ArrowLeft');
    const isFindReplaceShortcut = (isDesktop && event.metaKey && event.key === 'f') ||
                                  (!isDesktop && event.ctrlKey && event.key === 'f');
    const isDeHyphenShortcut = (isDesktop && event.metaKey && event.key === 'd') ||
                              (!isDesktop && event.ctrlKey && event.key === 'd');                        

    if (isSaveShortcut) {
      event.preventDefault();
      this.saveText();
    } else if (isNextPageShortcut) {
      this.nextPage(1);
    } else if (isPrevPageShortcut) {
      this.nextPage(-1);
    } else if (isDeHyphenShortcut) {
      this.deHyphen();
    } else if (isFindReplaceShortcut) {
      this.showFindReplace();
    }
  }


  cancelEdits() {
    this.getSavedProjectData();
    this.dirty = false;
  }

  async nextPage(direction = 1 | -1) {

    const newIndex = this.pageIndex + direction;
    // Clamp the page index between 0 and totalPages-1, then add 1 for the URL
    const nextPage = Math.min(Math.max(0, newIndex), this.nPages - 1);

    this.setPage(nextPage);
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

  deHyphen(): string {
    if (!this.project) return this.editedText;
    if (!this.workingText) return this.workingText;

    let repl = deHyphenString(this.editedText || this.workingText);
    if (repl) {
      this.dirty = this.workingText !== repl;  // dirty if changed.
      this.workingText = repl;  // update the editor
      this.editedText = this.workingText;
    }

    return this.workingText;
  }

  showFindReplace() {
    this.showFindReplaceModal = true;
  }

  onFindReplace(event: {find: string, replace: string}) {
    console.log('here', event);
    if (this.textEditor) {
      this.textEditor.findReplace(event.find, event.replace);
      this.dirty = true;
    }
    this.showFindReplaceModal = false;
  }

  onFindReplaceDismiss() {
    this.showFindReplaceModal = false;
  }

  async goHome() {
    if (!this.dirty) {
      this.router.navigate(['/']);
    } else {
      let save = await this.ux.confirm('Edits not saved', `You have edits to your data. If you want to keep 
        them, hit Save Page before going home`, '', `Save`, `Don't Save`);
      if (save) {
        await this.saveText();
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  onLineHeightChange(event: any) {
    const value = event.detail.value;
    this.lineHeight = value; // Update the component property
    document.documentElement.style.setProperty('--text-line-height', value);
  }
  
  onFontSizeChange(event: any) {
    const value = event.detail.value;
    this.fontSize = value; // Update the component property
    document.documentElement.style.setProperty('--text-font-size', `${value}px`);
  }

} 