import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayComponent } from '../components/overlay/overlay.component';
import { OverlayStyle2Component } from '../components/overlay-style-2/overlay-style-2.component';
import { OverlayStyle3Component } from '../components/overlay-style-3/overlay-style-3.component';
import { OverlayLamej0r1Component } from '../components/overlay-lamej0r-1/overlay-lamej0r-1.component';
import { OverlayLamej0r2Component } from '../components/overlay-lamej0r-2/overlay-lamej0r-2.component';
import { OverlayLamej0r3Component } from '../components/overlay-lamej0r-3/overlay-lamej0r-3.component';
import { OverlayWaos1Component } from '../components/overlay-waos-1/overlay-waos-1.component';
import { OverlayWaos2Component } from '../components/overlay-waos-2/overlay-waos-2.component';
import { OverlayWaos3Component } from '../components/overlay-waos-3/overlay-waos-3.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OverlayComponent,
    OverlayStyle2Component,
    OverlayStyle3Component,
    OverlayLamej0r1Component,
    OverlayLamej0r2Component,
    OverlayLamej0r3Component,
    OverlayWaos1Component,
    OverlayWaos2Component,
    OverlayWaos3Component
  ],
  template: `
    <main class="page">
      <h1 class="page-title">Elegí tu overlay</h1>
      <p class="page-subtitle">3 cuentas × 3 estilos = 9 overlays para OBS</p>

      <div class="columns-container">
        <!-- Column 1: YUNARA LITERAL -->
        <div class="account-column">
          <div class="account-header pink">YUNARA LITERAL</div>
          
          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay></app-overlay>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/style-1</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/style-1', 1)" [class.copied]="copiedIndex === 1">
                {{ copiedIndex === 1 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-style-2></app-overlay-style-2>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/style-2</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/style-2', 2)" [class.copied]="copiedIndex === 2">
                {{ copiedIndex === 2 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-style-3></app-overlay-style-3>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/style-3</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/style-3', 3)" [class.copied]="copiedIndex === 3">
                {{ copiedIndex === 3 ? '✓' : '📋' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Column 2: LAMEJ0R -->
        <div class="account-column">
          <div class="account-header violet">LAMEJ0R</div>
          
          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-lamej0r-1></app-overlay-lamej0r-1>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/lamej0r/style-1</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/lamej0r/style-1', 4)" [class.copied]="copiedIndex === 4">
                {{ copiedIndex === 4 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-lamej0r-2></app-overlay-lamej0r-2>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/lamej0r/style-2</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/lamej0r/style-2', 5)" [class.copied]="copiedIndex === 5">
                {{ copiedIndex === 5 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-lamej0r-3></app-overlay-lamej0r-3>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/lamej0r/style-3</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/lamej0r/style-3', 6)" [class.copied]="copiedIndex === 6">
                {{ copiedIndex === 6 ? '✓' : '📋' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Column 3: WAOS -->
        <div class="account-column">
          <div class="account-header teal">WAOS</div>
          
          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-waos-1></app-overlay-waos-1>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/waos/style-1</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/waos/style-1', 7)" [class.copied]="copiedIndex === 7">
                {{ copiedIndex === 7 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-waos-2></app-overlay-waos-2>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/waos/style-2</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/waos/style-2', 8)" [class.copied]="copiedIndex === 8">
                {{ copiedIndex === 8 ? '✓' : '📋' }}
              </button>
            </div>
          </div>

          <div class="overlay-card">
            <div class="overlay-preview">
              <app-overlay-waos-3></app-overlay-waos-3>
            </div>
            <div class="overlay-footer">
              <code class="overlay-url">/overlay/waos/style-3</code>
              <button class="copy-btn" (click)="copyUrl('/overlay/waos/style-3', 9)" [class.copied]="copiedIndex === 9">
                {{ copiedIndex === 9 ? '✓' : '📋' }}
              </button>
            </div>
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
      min-height: 100vh;
      background-color: #18181b;
      padding: 2rem;
      padding-bottom: 4rem;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-y: auto;
      overflow-x: auto;
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

    .columns-container {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    .account-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 280px;
    }

    .account-header {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border-radius: 0.5rem;
      text-align: center;
    }

    .account-header.pink {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .account-header.violet {
      background: rgba(124, 58, 237, 0.15);
      color: #a78bfa;
      border: 1px solid rgba(124, 58, 237, 0.3);
    }

    .account-header.teal {
      background: rgba(20, 184, 166, 0.15);
      color: #5eead4;
      border: 1px solid rgba(20, 184, 166, 0.3);
    }

    .overlay-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .overlay-preview {
      background-color: #09090b;
      border-radius: 0.75rem;
      padding: 0.75rem;
    }

    .overlay-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .overlay-url {
      flex: 1;
      font-size: 0.7rem;
      color: #71717a;
      font-family: monospace;
      background: rgba(255,255,255,0.05);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      font-size: 0.75rem;
      padding: 0.35rem 0.5rem;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: #a1a1aa;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 32px;
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

    .page {
      height: 100vh;
      overflow-y: auto;
      background-color: #09090b;
      color: white;
      padding: 2rem;
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
