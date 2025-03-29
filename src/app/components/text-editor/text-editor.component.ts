import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonCardTitle,IonCardSubtitle, IonCardHeader, IonCard, IonCardContent } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';

declare global {
  interface Window {
    EasyMDE: any;
  }
}

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  standalone: true, 
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, FormsModule],
})
export class TextEditorComponent implements OnInit {
  @Input() text: string = '';  // text value when component is created
  @Output() textChanged = new EventEmitter<string>();
  
  easyMDE: any;
  editedText: string = '';  // the value of the text in the easyMDE editor
  externalChange: boolean = false;

  constructor() { 
    addIcons({ saveOutline });
  }

  ngOnInit() {
    this.editedText = this.text;

    this.easyMDE = new window.EasyMDE({
      sideBySideFullscreen: false, 
      element: document.getElementById('my-text-area'),
      renderingConfig: {
        singleLineBreaks: true, // false wraps the lines. not great for editing though,
      }
    });

    this.easyMDE.codemirror.on("change", () => {
      if(this.externalChange) {
        this.externalChange = false;
        return;
      }

      // console.log(this.easyMDE.value());
      this.editedText = this.easyMDE.value();

      // only emit text edits when the editedText is different than the input Text.
      if(this.text.localeCompare(this.editedText) !== 0) {
        // console.log('emitting text change', this.editedText);
        this.textChanged.emit(this.editedText);
      }
    });
    this.easyMDE.value(this.text);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'] && this.easyMDE) {
      this.externalChange = true;
      // console.log('changes', this.text, this.editedText, changes['text'].currentValue);
      // this.text = changes['text'].currentValue;
      this.easyMDE.value(changes['text'].currentValue);
    }
  }
}
