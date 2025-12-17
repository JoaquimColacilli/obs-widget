import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { OverlayStyle2Component } from '../components/overlay-style-2/overlay-style-2.component';
import { OverlayStyle3Component } from '../components/overlay-style-3/overlay-style-3.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, OverlayComponent, OverlayStyle2Component, OverlayStyle3Component],
  template: `
    <main class="page">
      <h1 class="page-title">Eligí tu estilo de overlay</h1>
      <p class="page-subtitle">Cada uno tiene su propia URL para usar en OBS</p>

      <div class="styles-grid">
        <!-- Style 1 -->
        <div class="style-section">
          <div class="style-header">
            <span class="style-badge pink">Estilo 1</span>
            <span class="style-desc">Horizontal Bar - Ideal para parte superior o inferior</span>
          </div>
          <div class="style-preview">
            <app-overlay></app-overlay>
          </div>
          <div class="style-url-row">
            <code class="style-url">/overlay/style-1</code>
            <button class="copy-btn" (click)="copyUrl('/overlay/style-1', 1)" [class.copied]="copiedIndex === 1">
              {{ copiedIndex === 1 ? '✓ Copiado!' : '📋 Copiar URL' }}
            </button>
          </div>
        </div>

        <!-- Style 2 -->
        <div class="style-section">
          <div class="style-header">
            <span class="style-badge purple">Estilo 2</span>
            <span class="style-desc">Vertical Minimal - Perfecto para esquinas</span>
          </div>
          <div class="style-preview">
            <app-overlay-style-2></app-overlay-style-2>
          </div>
          <div class="style-url-row">
            <code class="style-url">/overlay/style-2</code>
            <button class="copy-btn" (click)="copyUrl('/overlay/style-2', 2)" [class.copied]="copiedIndex === 2">
              {{ copiedIndex === 2 ? '✓ Copiado!' : '📋 Copiar URL' }}
            </button>
          </div>
        </div>

        <!-- Style 3 -->
        <div class="style-section">
          <div class="style-header">
            <span class="style-badge pink">Estilo 3</span>
            <span class="style-desc">Glass Grid - Look futurista con glassmorphism</span>
          </div>
          <div class="style-preview">
            <app-overlay-style-3></app-overlay-style-3>
          </div>
          <div class="style-url-row">
            <code class="style-url">/overlay/style-3</code>
            <button class="copy-btn" (click)="copyUrl('/overlay/style-3', 3)" [class.copied]="copiedIndex === 3">
              {{ copiedIndex === 3 ? '✓ Copiado!' : '📋 Copiar URL' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host { 
      display: block; 
    }
    
    .page {
      height: 100vh;
      background-color: #18181b;
      padding: 2rem;
      padding-bottom: 4rem;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-y: auto;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #a1a1aa;
      margin: 0 0 2rem 0;
    }

    .styles-grid {
      display: grid;
      gap: 3rem;
      max-width: 800px;
    }

    .style-section {
      display: flex;
      flex-direction: column;
    }

    .style-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .style-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .style-badge.pink {
      background-color: rgba(236, 72, 153, 0.2);
      color: #f472b6;
    }

    .style-badge.purple {
      background-color: rgba(168, 85, 247, 0.2);
      color: #c084fc;
    }

    .style-desc {
      font-size: 0.875rem;
      color: #a1a1aa;
    }

    .style-preview {
      display: inline-block;
      background-color: #09090b;
      border-radius: 0.75rem;
      padding: 1rem;
    }

    .style-url-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .style-url {
      font-size: 0.75rem;
      color: #71717a;
      font-family: monospace;
      background: rgba(255,255,255,0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .copy-btn {
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: #a1a1aa;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .copy-btn.copied {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
  `]
})
export class HomeComponent {
  copiedIndex: number | null = null;

  copyUrl(path: string, index: number) {
    const fullUrl = window.location.origin + path;
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.copiedIndex = index;
      setTimeout(() => {
        this.copiedIndex = null;
      }, 2000);
    });
  }
}

