import { Component, OnInit, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-resizable-panes',
  templateUrl: './resizable-panes.component.html',
  styleUrls: ['./resizable-panes.component.scss'],
  standalone: true,
  imports: [],
})
export class ResizablePanesComponent implements OnInit {
  @ViewChild('leftPane') leftPane!: ElementRef;
  @ViewChild('rightPane') rightPane!: ElementRef;
  @ViewChild('divider') divider!: ElementRef;
  
  leftPaneWidth = 50; // Default split 50/50
  private readonly STORAGE_KEY = 'leftPaneWidth';
  private isDragging = false;
  private containerWidth = 0;
  private startX = 0;
  private startLeftWidth = 0;

  ngOnInit() {
    // Restore the saved width from localStorage
    const savedWidth = localStorage.getItem(this.STORAGE_KEY);
    if (savedWidth) {
      this.leftPaneWidth = parseFloat(savedWidth);
    }
  }
  
  onMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX);
    event.preventDefault();
  }
  
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.startDrag(event.touches[0].clientX);
      event.preventDefault();
    }
  }
  
  private startDrag(clientX: number): void {
    this.isDragging = true;
    this.startX = clientX;
    this.startLeftWidth = this.leftPaneWidth;
    this.containerWidth = this.leftPane.nativeElement.parentElement.offsetWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.updatePaneWidths(event.clientX);
  }
  
  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    this.updatePaneWidths(event.touches[0].clientX);
  }
  
  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.stopDrag();
  }
  
  @HostListener('document:touchend')
  onTouchEnd(): void {
    this.stopDrag();
  }
  
  private stopDrag(): void {
    this.isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  
  private updatePaneWidths(clientX: number): void {
    const deltaX = clientX - this.startX;
    const deltaPercentage = (deltaX / this.containerWidth) * 100;
    let newLeftPaneWidth = this.startLeftWidth + deltaPercentage;
    
    // Constrain the divider position
    newLeftPaneWidth = Math.max(10, Math.min(90, newLeftPaneWidth));
    
    this.leftPaneWidth = newLeftPaneWidth;
    
    // Save the new width to localStorage
    localStorage.setItem(this.STORAGE_KEY, this.leftPaneWidth.toString());
  }
}