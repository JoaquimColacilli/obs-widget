import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
      <div class="animate-float">
        <!-- Main horizontal container -->
        <div class="container-hud animate-pulse-glow">
          
          <!-- Top gradient line -->
          <div class="gradient-line-top"></div>

          <!-- Content row -->
          <div class="content-row">
            
            <!-- Brand mark -->
            <div class="brand-mark">
              <div class="pulse-dot animate-pulse"></div>
              <span class="brand-text">Yunara</span>
            </div>

            <!-- Stats -->
            <div class="stats-container">
              <!-- Muertes -->
              <div class="stat-item">
                <lucide-icon [img]="Skull" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.deathsTotal | number }}</span>
                  <span class="stat-label">MUERTES</span>
                </div>
              </div>

              <!-- Abs (highlighted) -->
              <div class="stat-item highlighted">
                <lucide-icon [img]="Dumbbell" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.absTotal | number }}</span>
                  <span class="stat-label">ABS</span>
                </div>
              </div>

              <!-- Día -->
              <div class="stat-item">
                <lucide-icon [img]="Calendar" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.dayNumber }}</span>
                  <span class="stat-label">DÍA</span>
                </div>
              </div>

              <!-- LP/Rank -->
              <div class="stat-item">
                <lucide-icon [img]="Trophy" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value stat-value-sm text-shadow">{{ data.rank.tier }} {{ data.rank.division }}</span>
                  <span class="stat-label">{{ data.rank.lp }} LP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom gradient line -->
          <div class="gradient-line-bottom"></div>
        </div>

        <!-- Corner accents -->
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .overlay-wrapper {
      padding: 0.75rem;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .animate-float {
      animation: float 4s ease-in-out infinite;
      position: relative;
    }
    
    .container-hud {
      position: relative;
      background-color: rgba(9, 9, 11, 0.9);
      backdrop-filter: blur(4px);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .gradient-line-top {
      height: 2px;
      background: linear-gradient(to right, #ec4899, #a855f7, #ec4899);
    }
    
    .gradient-line-bottom {
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), transparent);
    }

    .content-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.625rem 0.875rem;
    }
    
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-right: 1rem;
      border-right: 1px solid rgba(236, 72, 153, 0.3);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #ec4899;
    }

    .brand-text {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #f472b6;
      text-transform: uppercase;
    }

    .stats-container {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding-left: 0.75rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-item.highlighted {
      padding: 0.375rem 0.625rem;
      border-radius: 0.375rem;
      background-color: rgba(236, 72, 153, 0.1);
      border: 1px solid rgba(236, 72, 153, 0.2);
    }

    .stat-icon {
      width: 14px;
      height: 14px;
      color: #f472b6;
    }

    .icon-shadow {
      filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.5));
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: 700;
      color: white;
      line-height: 1;
    }

    .stat-value-sm {
      font-size: 0.875rem;
    }

    .text-shadow {
      text-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
    }
    
    .stat-label {
      font-size: 9px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .corner {
      position: absolute;
      width: 10px;
      height: 10px;
      border-color: rgba(236, 72, 153, 0.7);
      border-style: solid;
    }
    
    .top-left { top: -3px; left: -3px; border-width: 2px 0 0 2px; }
    .top-right { top: -3px; right: -3px; border-width: 2px 2px 0 0; }
    .bottom-left { bottom: -3px; left: -3px; border-width: 0 0 2px 2px; }
    .bottom-right { bottom: -3px; right: -3px; border-width: 0 2px 2px 0; }
  `]
})
export class OverlayComponent implements OnInit {
  snapshot$: Observable<Snapshot>;

  // Icons
  Skull = Skull;
  Dumbbell = Dumbbell;
  Calendar = Calendar;
  Trophy = Trophy;

  constructor(private trackerService: TrackerService) {
    this.snapshot$ = this.trackerService.getSnapshot();
  }

  ngOnInit() { }
}
