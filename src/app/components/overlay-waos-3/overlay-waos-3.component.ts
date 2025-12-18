import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay-waos-3',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-waos.png" class="cosmic-bg" alt="">
    <div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div>
    <div class="sparkle s1"></div><div class="sparkle s2"></div><div class="sparkle s3"></div><div class="sparkle s4"></div>
    <div class="animate-float">
        <div class="outer-container">
          <div class="glow-ring"></div>
          <div class="main-container breathing-border">
            <div class="header">
              <div class="header-content">
                <div class="header-line left"></div>
                <div class="header-text-container">
                  <span class="challenge-text">RETO YUNARA ABS</span>
                  <span class="nick-text">WAOS #kmu</span>
                </div>
                <div class="header-line right"></div>
              </div>
            </div>
            <div class="stats-grid-wrapper">
              <div class="stats-grid">
                <div class="glass-card">
                  <lucide-icon [img]="Skull" class="card-icon"></lucide-icon>
                  <div class="card-value">{{ data.accountDeaths | number }}</div>
                  <div class="card-total">Total: {{ data.totalDeaths | number }}</div>
                </div>
                <div class="glass-card primary">
                  <lucide-icon [img]="Dumbbell" class="card-icon primary-icon"></lucide-icon>
                  <div class="card-value primary-value">{{ data.accountAbs | number }}</div>
                  <div class="card-total">Total: {{ data.totalAbs | number }}</div>
                  <div class="corner-accent"></div>
                </div>
                <div class="glass-card">
                  <lucide-icon [img]="Calendar" class="card-icon"></lucide-icon>
                  <div class="card-value">{{ data.dayNumber }}</div>
                  <div class="card-label">DÍA</div>
                </div>
                <div class="glass-card">
                  <lucide-icon [img]="Trophy" class="card-icon"></lucide-icon>
                  <div class="card-value card-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</div>
                  <div class="card-label">{{ data.rank.lp }} LP</div>
                </div>
              </div>
            </div>
            <div class="bottom-accent"></div>
          </div>
          <svg class="corner-svg top-left" viewBox="0 0 16 16" fill="none"><path d="M0 8V0H8" stroke="currentColor" stroke-width="1.5" /></svg>
          <svg class="corner-svg top-right" viewBox="0 0 16 16" fill="none"><path d="M16 8V0H8" stroke="currentColor" stroke-width="1.5" /></svg>
          <svg class="corner-svg bottom-left" viewBox="0 0 16 16" fill="none"><path d="M0 8V16H8" stroke="currentColor" stroke-width="1.5" /></svg>
          <svg class="corner-svg bottom-right" viewBox="0 0 16 16" fill="none"><path d="M16 8V16H8" stroke="currentColor" stroke-width="1.5" /></svg>
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
      object-fit: cover; opacity: 0.4; filter: blur(2px);
      border-radius: 1.5rem; z-index: 0;
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
    .outer-container { position: relative; width: fit-content; }
    .glow-ring { position: absolute; inset: -4px; background: linear-gradient(to right, rgba(20, 184, 166, 0.3), rgba(94, 234, 212, 0.3), rgba(20, 184, 166, 0.3)); border-radius: 1.5rem; filter: blur(12px); animation: glowPulse 4s ease-in-out infinite; }
    @keyframes glowPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
    .main-container { position: relative; background-color: rgba(9, 9, 11, 0.3); backdrop-filter: blur(12px); border-radius: 1.5rem; border: 1px solid rgba(20, 184, 166, 0.25); overflow: hidden; min-width: 340px; }
    .header { position: relative; padding: 1.125rem 1.5rem; background: linear-gradient(to right, rgba(20, 184, 166, 0.08), rgba(94, 234, 212, 0.08), rgba(20, 184, 166, 0.08)); }
    .header-content { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .header-line { height: 1px; flex: 1; }
    .header-line.left { background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.5)); }
    .header-line.right { background: linear-gradient(to left, transparent, rgba(20, 184, 166, 0.5)); }
    .header-text-container { display: flex; flex-direction: column; align-items: center; gap: 0.125rem; }
    .challenge-text { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.2em; color: #99f6e4; text-transform: uppercase; white-space: nowrap; }
    .nick-text { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.1em; color: white; text-transform: uppercase; white-space: nowrap; }
    .stats-grid-wrapper { padding: 1rem 1.25rem 1.5rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .glass-card { position: relative; padding: 0.875rem 1rem; border-radius: 0.875rem; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); }
    .glass-card:hover { border-color: rgba(20, 184, 166, 0.3); }
    .glass-card.primary { background: linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(94, 234, 212, 0.18) 100%); border: 1.5px solid rgba(20, 184, 166, 0.5); box-shadow: 0 4px 20px rgba(20, 184, 166, 0.15); }
    .card-icon { width: 1.125rem; height: 1.125rem; color: #71717a; margin-bottom: 0.5rem; display: block; }
    .primary-icon { color: #5eead4; filter: drop-shadow(0 0 8px rgba(20, 184, 166, 0.6)); }
    .card-value { font-size: 1.875rem; font-weight: 700; line-height: 1; margin-bottom: 0.25rem; color: white; }
    .card-value-sm { font-size: 1.375rem; }
    .primary-value { color: #ccfbf1; text-shadow: 0 0 20px rgba(20, 184, 166, 0.5); }
    .card-label { font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 500; }
    .card-total { font-size: 0.55rem; color: #e4e4e7; font-weight: 500; letter-spacing: 0.02em; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .corner-accent { position: absolute; top: 6px; right: 6px; width: 10px; height: 10px; border-top: 1px solid rgba(94, 234, 212, 0.6); border-right: 1px solid rgba(94, 234, 212, 0.6); border-top-right-radius: 3px; }
    .bottom-accent { height: 4px; background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.5), transparent); }
    .corner-svg { position: absolute; width: 1rem; height: 1rem; color: rgba(20, 184, 166, 0.6); animation: cornerBreath 4s ease-in-out infinite; }
    @keyframes cornerBreath { 0%, 100% { color: rgba(20, 184, 166, 0.4); } 50% { color: rgba(20, 184, 166, 0.9); } }
    .corner-svg.top-left { top: -8px; left: -8px; }
    .corner-svg.top-right { top: -8px; right: -8px; }
    .corner-svg.bottom-left { bottom: -8px; left: -8px; }
    .corner-svg.bottom-right { bottom: -8px; right: -8px; }
  `]
})
export class OverlayWaos3Component implements OnInit {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy;
  constructor(private trackerService: TrackerService) { }
  ngOnInit() { this.snapshot$ = this.trackerService.getSnapshot('account3'); }
}
