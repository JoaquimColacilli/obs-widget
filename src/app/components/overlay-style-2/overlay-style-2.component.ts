import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay-style-2',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
      <div class="animate-float">
        <!-- Vertical stack -->
        <div class="vertical-container">
          
          <!-- Header -->
          <div class="header">
            <div class="pulse-dot animate-pulse"></div>
            <span class="header-text">Reto Yunara</span>
          </div>

          <!-- Stats -->
          <div class="stat-row">
            <div class="stat-left">
              <lucide-icon [img]="Skull" class="stat-icon"></lucide-icon>
              <span class="stat-label">Muertes</span>
            </div>
            <span class="stat-value">{{ data.deathsTotal | number }}</span>
          </div>

          <div class="stat-row featured animate-pulse-glow">
            <div class="stat-left">
              <lucide-icon [img]="Dumbbell" class="stat-icon featured-icon"></lucide-icon>
              <span class="stat-label">Abdominales</span>
            </div>
            <span class="stat-value featured-value">{{ data.absTotal | number }}</span>
          </div>

          <div class="stat-row">
            <div class="stat-left">
              <lucide-icon [img]="Calendar" class="stat-icon"></lucide-icon>
              <span class="stat-label">Día</span>
            </div>
            <span class="stat-value">{{ data.dayNumber }}</span>
          </div>

          <div class="stat-row">
            <div class="stat-left">
              <lucide-icon [img]="Trophy" class="stat-icon"></lucide-icon>
              <span class="stat-label">{{ data.rank.lp }} LP</span>
            </div>
            <span class="stat-value stat-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</span>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
    }
    
    .overlay-wrapper {
      padding: 0.75rem;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    
    .vertical-container {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 11rem;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2));
      border-radius: 0.5rem;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #ec4899;
    }

    .header-text {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #f9a8d4;
      text-transform: uppercase;
    }
    
    .stat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      background-color: rgba(24, 24, 27, 0.8);
      border: 1px solid rgba(39, 39, 42, 0.5);
      transition: all 0.2s;
    }
    
    .stat-row.featured {
      background: linear-gradient(to right, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15));
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .stat-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 1rem;
      height: 1rem;
      color: #a1a1aa;
    }

    .featured-icon {
      color: #f472b6;
      filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.6));
    }

    .stat-label {
      font-size: 10px;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: white;
    }

    .stat-value-sm {
      font-size: 0.875rem;
    }

    .featured-value {
      color: #f9a8d4;
      text-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
    }
  `]
})
export class OverlayStyle2Component {
  snapshot$: Observable<Snapshot>;

  Skull = Skull;
  Dumbbell = Dumbbell;
  Calendar = Calendar;
  Trophy = Trophy;

  constructor(private trackerService: TrackerService) {
    this.snapshot$ = this.trackerService.getSnapshot();
  }
}
