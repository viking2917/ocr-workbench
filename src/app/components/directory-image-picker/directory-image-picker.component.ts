import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { folderOpenOutline } from 'ionicons/icons';

import { Page } from 'src/app/classes/classes';

@Component({
  selector: 'app-directory-image-picker',
  templateUrl: './directory-image-picker.component.html',
  styleUrls: ['./directory-image-picker.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton],
})
export class DirectoryImagePickerComponent /*implements OnInit*/ {
  @Output() imagesSelected = new EventEmitter<Page[]>();
  @ViewChild('fileInput') fileInput: ElementRef|undefined;

  selectedDirectory: string = '';
  imageFiles: string[] = [];
  pages: Page[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  supportedFormats: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  showToast: boolean = false;

  constructor(private platform: Platform) {
     addIcons({ folderOpenOutline });
  }

  // ngOnInit() {}


  // Trigger the file input click
  openFileSelector() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  // Handle file selection
  async handleFileSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.imageFiles = [];
    this.pages = [];
    
    try {
      // Get directory name from the first file's path
      const firstFile = input.files[0];
      const fullPath = firstFile.webkitRelativePath;
      const pathParts = fullPath.split('/');
      
      if (pathParts.length > 0) {
        this.selectedDirectory = pathParts[0]; // Directory name
      }
      
      // Process all files
      await this.processFiles(input.files);
      // this.imagesSelected.emit(this.imageFiles);
      this.imagesSelected.emit(this.pages);
    } catch (error) {
      console.error('Error processing files:', error);
      this.errorMessage = 'Failed to process files. ' + 
                          (error instanceof Error ? error.message : String(error));
    } finally {
      this.isLoading = false;
      // Reset the input to allow selecting the same directory again
      input.value = '';
    }
  }

  private async processFiles(files: FileList) {

    // Sort files by filename before processing
    const sortedFiles = Array.from(files).sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'});
    });
    files = sortedFiles as unknown as FileList;

    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      
      // Check if the file is an image based on extension
      if (this.supportedFormats.some(format => fileName.endsWith(format))) {
        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        this.imageFiles.push(dataUrl);
        this.pages.push(new Page({filename: fileName, imageData: dataUrl}));
      }
    }
  }

  // Alternative method for Capacitor on mobile platforms
  async selectDirectoryCapacitor() {
    this.isLoading = true;
    this.errorMessage = '';
    this.imageFiles = [];
    this.pages = [];
    
    try {
      // This is a simplified approach since Capacitor doesn't directly support directory selection
      // You may need to implement a custom solution based on your specific requirements
      const result = await Filesystem.readdir({
        path: '/',
        directory: Directory.Documents
      });
      
      this.selectedDirectory = 'Documents';
      
      // Process all files in the directory
      for (const entry of result.files) {
        const fileName = entry.name.toLowerCase();
        if (this.supportedFormats.some(format => fileName.endsWith(format))) {
          const fileUri = entry.uri;
          // For mobile, you would use the file URI directly
          this.imageFiles.push(fileUri);
          this.pages.push(new Page({filename: fileName, imageData: fileUri}));
        }
      }
      
      // this.imagesSelected.emit(this.imageFiles);
      this.imagesSelected.emit(this.pages);
    } catch (error) {
      console.error('Error reading directory:', error);
      this.errorMessage = 'Failed to read directory. ' + 
                         (error instanceof Error ? error.message : String(error));
    } finally {
      this.isLoading = false;
    }
  }

  // Determine which method to use based on platform
  pickDirectory() {
    if (this.platform.is('capacitor')) {
      this.selectDirectoryCapacitor();
    } else {
      this.openFileSelector();
    }
  }
}
