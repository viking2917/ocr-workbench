import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonCardHeader, IonCard, IonCardContent, IonCardSubtitle, IonTextarea } from '@ionic/angular/standalone';

@Component({
  selector: 'app-prompt-input',
  templateUrl: './prompt-input.component.html',
  styleUrls: ['./prompt-input.component.scss'],
  standalone: true,
  imports: [FormsModule,
    IonCardHeader, IonCard, IonCardContent, IonCardSubtitle, IonTextarea
  ],
})
export class PromptInputComponent implements OnInit {
  @Input() defaultPrompt = 'Please extract and format the text from this image.';
  @Output() promptChanged = new EventEmitter<string>();

  prompt: string = '';

  constructor() { }

  ngOnInit() {
    this.prompt = this.defaultPrompt;
  }

  onPromptChange() {
    this.promptChanged.emit(this.prompt);
  }
}
