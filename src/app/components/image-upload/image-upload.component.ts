import { Component, EventEmitter, Output } from '@angular/core';

import { IonIcon, IonButton} from '@ionic/angular/standalone';
    
import { addIcons } from 'ionicons';
import { image } from 'ionicons/icons';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: true, 
  imports: [IonIcon, IonButton],
})
export class ImageUploadComponent{
  @Output() imageSelected = new EventEmitter<{filename: string, imageData:string}>();
  imagePreviewUrl: string | null = null;

  constructor() { 
     addIcons({ image });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    const filename = input.files[0].name;
    
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.imageSelected.emit({filename, imageData: reader.result as string});
    };
    
    reader.readAsDataURL(file);
  }

  triggerFileInput() {
    document.getElementById('file-input')?.click();
  }
}
