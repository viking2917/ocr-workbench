import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonToolbar, IonTitle, IonHeader, IonContent, IonIcon, IonButton, IonInput, IonItem, IonList, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

import { OcrService } from '../services/ocr.service';
import { addIcons } from 'ionicons';
import { newspaper, key, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, IonHeader, IonTitle, IonContent, IonIcon, IonButton, IonInput, IonToolbar, IonItem, IonList, IonSelect, IonSelectOption]
})
export class SettingsPage implements OnInit {
  ocrStrategies: string[] = [];
  geminiApiKey: string = '';

  constructor(public ocrService: OcrService) {
    addIcons({ newspaper, key, trashOutline });
  }

  ngOnInit() {
    this.ocrStrategies = this.ocrService.strategies;
    // Load saved API key from localStorage
    this.geminiApiKey = localStorage.getItem('geminiApiKey') || '';
  }

  handleChange(event: any) {
    this.ocrService.setStorageStrategy(event.detail.value);
  }

  onApiKeyChange(event: any) {
    const newKey = event.detail.value;
    if (newKey) {
      localStorage.setItem('geminiApiKey', newKey);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
  }

  clearApiKey() {
    this.geminiApiKey = '';
    localStorage.removeItem('geminiApiKey');
  }
}
