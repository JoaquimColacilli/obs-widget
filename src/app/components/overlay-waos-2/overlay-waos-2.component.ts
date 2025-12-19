import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay-waos-2',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-waos.png" class="cosmic-bg" alt="">
    <div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div>
    <div class="sparkle s1"></div><div class="sparkle s2"></div><div class="sparkle s3"></div><div class="sparkle s4"></div>
    <div class="animate-float">
        <div class="vertical-container breathing-border">
          <div class="header">
            <div class="header-top">
              <div class="pulse-dot"></div>
              <span class="challenge-text">RETO YUNARA ABS</span>
            </div>
            <span class="nick-text">WAOS #kmu</span>
          </div>
          <div class="stat-row">
            <div class="stat-left">
              <lucide-icon [img]="Skull" class="stat-icon"></lucide-icon>
              <span class="stat-label">Muertes</span>
            </div>
            <div class="stat-right">
              <span class="stat-value">{{ data.accountDeaths | number }}</span>
              <span class="stat-totals">Total: {{ data.totalDeaths | number }} · <span class="stat-today">Hoy: {{ data.todayDeaths | number }}</span></span>
            </div>
          </div>
          <div class="stat-row featured">
            <div class="stat-left">
              <lucide-icon [img]="Dumbbell" class="stat-icon featured-icon"></lucide-icon>
              <span class="stat-label">Abdominales</span>
            </div>
            <div class="stat-right">
              <span class="stat-value featured-value">{{ data.accountAbs | number }}</span>
              <span class="stat-totals">Total: {{ data.totalAbs | number }} · <span class="stat-today">Hoy: {{ data.todayAbs | number }}</span></span>
            </div>
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
</div>
  `,
  styles: [`
    :host { display: block; }
    .overlay-wrapper { display: inline-block; font-family: 'Inter', system-ui, sans-serif; }
    .overlay-container { position: relative; padding: 0.1rem; }
    .cosmic-bg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.3; filter: blur(5px);
      border-radius: 0.75rem; z-index: 0;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      pointer-events: none;
    }
    .particle { position: absolute; width: 3px; height: 3px; background: #5eead4; border-radius: 50%; opacity: 0.2; pointer-events: none; z-index: 2; }
    .p1 { top: 15%; left: 10%; animation: floatParticle 8s ease-in-out infinite; }
    .p2 { top: 60%; left: 85%; animation: floatParticle 7s ease-in-out infinite 1s; }
    .p3 { top: 30%; left: 50%; animation: floatParticle 9s ease-in-out infinite 2s; }
    .p4 { top: 75%; left: 25%; animation: floatParticle 6s ease-in-out infinite 3s; }
    .p5 { top: 45%; left: 70%; animation: floatParticle 10s ease-in-out infinite 4s; }
    @keyframes floatParticle { 0%, 100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-12px); opacity: 0.35; } }
    .sparkle { position: absolute; width: 8px; height: 8px; opacity: 0; pointer-events: none; z-index: 3; }
    .sparkle::before, .sparkle::after { content: ''; position: absolute; background: #5eead4; }
    .sparkle::before { width: 100%; height: 2px; top: 50%; left: 0; transform: translateY(-50%); }
    .sparkle::after { width: 2px; height: 100%; left: 50%; top: 0; transform: translateX(-50%); }
    .s1 { top: 2px; left: 2px; animation: sparkle 11s ease-in-out infinite; }
    .s2 { top: 2px; right: 2px; animation: sparkle 13s ease-in-out infinite 3s; }
    .s3 { bottom: 2px; left: 2px; animation: sparkle 10s ease-in-out infinite 6s; }
    .s4 { bottom: 2px; right: 2px; animation: sparkle 12s ease-in-out infinite 9s; }
    @keyframes sparkle { 0%, 95%, 100% { opacity: 0; transform: scale(0.5); } 97% { opacity: 0.6; transform: scale(1); } }
    .animate-float { position: relative; z-index: 1; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .breathing-border { animation: breathe 4s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.15); } 50% { box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.3); } }
    .vertical-container { display: flex; flex-direction: column; gap: 0.375rem; width: 13rem; }
    .header { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.75rem; background: linear-gradient(to right, rgba(20, 184, 166, 0.2), rgba(94, 234, 212, 0.2)); border-radius: 0.5rem; border: 1px solid rgba(20, 184, 166, 0.3); }
    .header-top { display: flex; align-items: center; gap: 0.5rem; }
    .pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: #14b8a6; animation: pulseDot 2s ease-in-out infinite; }
    @keyframes pulseDot { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    .challenge-text { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; color: #99f6e4; text-transform: uppercase; }
    .nick-text { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.05em; color: white; text-transform: uppercase; }
    .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgba(24, 24, 27, 0.8); border: 1px solid rgba(39, 39, 42, 0.5); }
    .stat-row.featured { background: linear-gradient(to right, rgba(20, 184, 166, 0.15), rgba(94, 234, 212, 0.15)); border: 1px solid rgba(20, 184, 166, 0.3); }
    .stat-left { display: flex; align-items: center; gap: 0.75rem; }
    .stat-right { display: flex; flex-direction: column; align-items: flex-end; }
    .stat-icon { width: 1rem; height: 1rem; color: #a1a1aa; }
    .featured-icon { color: #5eead4; filter: drop-shadow(0 0 6px rgba(20, 184, 166, 0.6)); }
    .stat-label { font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 1.125rem; font-weight: 700; color: white; }
    .stat-value-sm { font-size: 0.875rem; }
    .stat-totals { display: flex; gap: 0.35rem; font-size: 0.55rem; color: #e4e4e7; font-weight: 500; letter-spacing: 0.02em; margin-top: 1px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); white-space: nowrap; }
    .stat-today { color: #99f6e4; font-weight: 600; }
    .featured-value { color: #99f6e4; text-shadow: 0 0 15px rgba(20, 184, 166, 0.5); }
  `]
})
export class OverlayWaos2Component implements OnInit {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy;
  constructor(private trackerService: TrackerService) { }
  ngOnInit() { this.snapshot$ = this.trackerService.getSnapshot('account3'); }
}
