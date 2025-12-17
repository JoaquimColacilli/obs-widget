import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay-style-3',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
      <div class="animate-float">
        <div class="outer-container">
          <!-- Outer glow ring -->
          <div class="glow-ring animate-pulse"></div>

          <!-- Main container -->
          <div class="main-container">
            
            <!-- Header with gradient -->
            <div class="header">
              <div class="header-content">
                <div class="header-line left"></div>
                <span class="header-text">Yunara Challenge</span>
                <div class="header-line right"></div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid-wrapper">
              <div class="stats-grid">
                <!-- Muertes -->
                <div class="glass-card">
                  <lucide-icon [img]="Skull" class="card-icon"></lucide-icon>
                  <div class="card-value">{{ data.deathsTotal | number }}</div>
                  <div class="card-label">MUERTES</div>
                </div>

                <!-- Abs (Primary) -->
                <div class="glass-card primary">
                  <lucide-icon [img]="Dumbbell" class="card-icon primary-icon"></lucide-icon>
                  <div class="card-value primary-value">{{ data.absTotal | number }}</div>
                  <div class="card-label primary-label">ABS</div>
                  <div class="corner-accent"></div>
                </div>

                <!-- Día -->
                <div class="glass-card">
                  <lucide-icon [img]="Calendar" class="card-icon"></lucide-icon>
                  <div class="card-value">{{ data.dayNumber }}</div>
                  <div class="card-label">DÍA</div>
                </div>

                <!-- Rank -->
                <div class="glass-card">
                  <lucide-icon [img]="Trophy" class="card-icon"></lucide-icon>
                  <div class="card-value card-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</div>
                  <div class="card-label">{{ data.rank.lp }} LP</div>
                </div>
              </div>
            </div>

            <!-- Bottom accent -->
            <div class="bottom-accent"></div>
          </div>

          <!-- Decorative corners -->
          <svg class="corner-svg top-left" viewBox="0 0 16 16" fill="none">
            <path d="M0 8V0H8" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <svg class="corner-svg top-right" viewBox="0 0 16 16" fill="none">
            <path d="M16 8V0H8" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <svg class="corner-svg bottom-left" viewBox="0 0 16 16" fill="none">
            <path d="M0 8V16H8" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <svg class="corner-svg bottom-right" viewBox="0 0 16 16" fill="none">
            <path d="M16 8V16H8" stroke="currentColor" stroke-width="1.5" />
          </svg>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
    }

    .overlay-wrapper {
      padding: 1rem;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .animate-float {
      animation: float 4s ease-in-out infinite;
    }

    .outer-container {
      position: relative;
      width: fit-content;
    }

    .glow-ring {
      position: absolute;
      inset: -4px;
      background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3));
      border-radius: 1.5rem;
      filter: blur(12px);
    }

    .main-container {
      position: relative;
      background-color: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(12px);
      border-radius: 1.5rem;
      border: 1px solid rgba(236, 72, 153, 0.25);
      overflow: hidden;
      min-width: 240px;
    }

    .header {
      position: relative;
      padding: 1.125rem 1.5rem;
      background: linear-gradient(to right, rgba(236, 72, 153, 0.08), rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.08));
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .header-line {
      height: 1px;
      flex: 1;
    }

    .header-line.left {
      background: linear-gradient(to right, transparent, rgba(236, 72, 153, 0.5));
    }

    .header-line.right {
      background: linear-gradient(to left, transparent, rgba(236, 72, 153, 0.5));
    }

    .header-text {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #f472b6;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .stats-grid-wrapper {
      padding: 1rem 1.25rem 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .glass-card {
      position: relative;
      padding: 0.875rem 1rem;
      border-radius: 0.875rem;
      transition: all 0.3s;
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .glass-card:hover {
      border-color: rgba(236, 72, 153, 0.3);
    }

    .glass-card.primary {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.18) 100%);
      border: 1.5px solid rgba(236, 72, 153, 0.5);
      box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15);
    }

    .card-icon {
      width: 1.125rem;
      height: 1.125rem;
      color: #71717a;
      margin-bottom: 0.5rem;
      display: block;
    }

    .primary-icon {
      color: #f472b6;
      filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.6));
    }

    .card-value {
      font-size: 1.875rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
      color: white;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }

    .card-value-sm {
      font-size: 1.375rem;
    }

    .primary-value {
      color: #fbcfe8;
      text-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
    }

    .card-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #71717a;
      font-weight: 500;
    }

    .primary-label {
      color: #a1a1aa;
    }

    .corner-accent {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 10px;
      height: 10px;
      border-top: 1px solid rgba(244, 114, 182, 0.6);
      border-right: 1px solid rgba(244, 114, 182, 0.6);
      border-top-right-radius: 3px;
    }

    .bottom-accent {
      height: 4px;
      background: linear-gradient(to right, transparent, rgba(236, 72, 153, 0.5), transparent);
    }

    .corner-svg {
      position: absolute;
      width: 1rem;
      height: 1rem;
      color: rgba(236, 72, 153, 0.6);
    }

    .corner-svg.top-left { top: -8px; left: -8px; }
    .corner-svg.top-right { top: -8px; right: -8px; }
    .corner-svg.bottom-left { bottom: -8px; left: -8px; }
    .corner-svg.bottom-right { bottom: -8px; right: -8px; }
  `]
})
export class OverlayStyle3Component {
  snapshot$: Observable<Snapshot>;

  Skull = Skull;
  Dumbbell = Dumbbell;
  Calendar = Calendar;
  Trophy = Trophy;

  constructor(private trackerService: TrackerService) {
    this.snapshot$ = this.trackerService.getSnapshot();
  }
}
