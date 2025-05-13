import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { IonRadio, IonRadioGroup, IonLabel, IonToolbar, IonTitle, IonHeader, IonContent, IonIcon, IonButton, IonInput, IonItem, IonList } from '@ionic/angular/standalone';

import { OcrService } from '../services/ocr.service';
import { addIcons } from 'ionicons';
import { newspaper, key, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [FormsModule, NgFor, IonRadioGroup, IonRadio, IonLabel, IonHeader, IonTitle, IonContent, 
    IonIcon, IonButton, IonInput, IonToolbar, IonItem, IonList],
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

  handleOcrChange(event: any) {
    const selectedStrategy = event.detail.value;
    console.log('Selected OCR strategy:', selectedStrategy);
    this.ocrService.setStorageStrategy(selectedStrategy, true);
    return false;
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
