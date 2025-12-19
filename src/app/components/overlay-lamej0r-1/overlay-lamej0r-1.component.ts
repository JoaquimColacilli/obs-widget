import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overlay-lamej0r-1',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-lamejor.png" class="cosmic-bg" alt="">
    <!-- Floating Particles - Almas de Yunara -->
    <div class="particle p1"></div>
    <div class="particle p2"></div>
    <div class="particle p3"></div>
    <div class="particle p4"></div>
    <div class="particle p5"></div>
    <!-- Corner Sparkles -->
    <div class="sparkle s1"></div>
    <div class="sparkle s2"></div>
    <div class="sparkle s3"></div>
    <div class="sparkle s4"></div>
    <div class="animate-float">
        <div class="container-hud breathing-border">
          <div class="gradient-line-top"></div>
          <div class="content-row">
            <div class="brand-mark">
              <div class="pulse-dot"></div>
              <span class="brand-text">LAMEJ0R #LAS</span>
            </div>
            <div class="stats-container">
              <div class="stat-item">
                <lucide-icon [img]="Skull" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.accountDeaths | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalDeaths | number }} · <span class="stat-today">Hoy: {{ data.todayDeaths | number }}</span></span>
                </div>
              </div>
              <div class="stat-item highlighted">
                <lucide-icon [img]="Dumbbell" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.accountAbs | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalAbs | number }} · <span class="stat-today">Hoy: {{ data.todayAbs | number }}</span></span>
                </div>
              </div>
              <div class="stat-item">
                <lucide-icon [img]="Calendar" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value text-shadow">{{ data.dayNumber }}</span>
                  <span class="stat-label">DÍA</span>
                </div>
              </div>
              <div class="stat-item">
                <lucide-icon [img]="Trophy" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-value stat-value-sm text-shadow">{{ data.rank.tier }} {{ data.rank.division }}</span>
                  <span class="stat-label">{{ data.rank.lp }} LP</span>
                </div>
              </div>
            </div>
          </div>
          <div class="gradient-line-bottom"></div>
        </div>
        <div class="corner top-left"></div>
        <div class="corner top-right"></div>
        <div class="corner bottom-left"></div>
        <div class="corner bottom-right"></div>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host { display: inline-block; }
    .overlay-wrapper { display: inline-block; font-family: 'Inter', system-ui, sans-serif; }
    .overlay-container { position: relative; padding: 0.1rem; }
    
    /* Cosmic Background */
    .cosmic-bg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.4; filter: blur(2px);
      border-radius: 0.75rem; z-index: 0;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      pointer-events: none;
    }
    
    /* Floating Particles - Almas de Yunara */
    .particle {
      position: absolute;
      width: 3px; height: 3px;
      background: #a78bfa;
      border-radius: 50%;
      opacity: 0.2;
      pointer-events: none;
      z-index: 2;
    }
    .p1 { top: 15%; left: 10%; animation: floatParticle 8s ease-in-out infinite; }
    .p2 { top: 60%; left: 85%; animation: floatParticle 7s ease-in-out infinite 1s; }
    .p3 { top: 30%; left: 50%; animation: floatParticle 9s ease-in-out infinite 2s; }
    .p4 { top: 75%; left: 25%; animation: floatParticle 6s ease-in-out infinite 3s; }
    .p5 { top: 45%; left: 70%; animation: floatParticle 10s ease-in-out infinite 4s; }
    
    @keyframes floatParticle {
      0%, 100% { transform: translateY(0); opacity: 0.2; }
      50% { transform: translateY(-12px); opacity: 0.35; }
    }
    
    /* Corner Sparkles */
    .sparkle {
      position: absolute;
      width: 8px; height: 8px;
      opacity: 0;
      pointer-events: none;
      z-index: 3;
    }
    .sparkle::before, .sparkle::after {
      content: '';
      position: absolute;
      background: #a78bfa;
    }
    .sparkle::before {
      width: 100%; height: 2px;
      top: 50%; left: 0;
      transform: translateY(-50%);
    }
    .sparkle::after {
      width: 2px; height: 100%;
      left: 50%; top: 0;
      transform: translateX(-50%);
    }
    .s1 { top: 2px; left: 2px; animation: sparkle 11s ease-in-out infinite; }
    .s2 { top: 2px; right: 2px; animation: sparkle 13s ease-in-out infinite 3s; }
    .s3 { bottom: 2px; left: 2px; animation: sparkle 10s ease-in-out infinite 6s; }
    .s4 { bottom: 2px; right: 2px; animation: sparkle 12s ease-in-out infinite 9s; }
    
    @keyframes sparkle {
      0%, 95%, 100% { opacity: 0; transform: scale(0.5); }
      97% { opacity: 0.6; transform: scale(1); }
    }
    
    /* Float animation */
    .animate-float { position: relative; z-index: 1; animation: float 4s ease-in-out infinite; }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    
    /* Breathing Border Effect */
    .breathing-border {
      animation: breathe 4s ease-in-out infinite;
    }
    @keyframes breathe {
      0%, 100% { box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.15); }
      50% { box-shadow: 0 0 8px 1px rgba(124, 58, 237, 0.3); }
    }
    
    /* Main Container */
    .container-hud { 
      position: relative; 
      background-color: rgba(9, 9, 11, 0.3); 
      backdrop-filter: blur(8px); 
      border-radius: 0.75rem; 
      overflow: hidden; 
    }
    .gradient-line-top { height: 2px; background: linear-gradient(to right, #7c3aed, #a78bfa, #7c3aed); }
    .gradient-line-bottom { height: 2px; background: linear-gradient(to right, transparent, rgba(124, 58, 237, 0.5), transparent); }
    .content-row { display: flex; align-items: center; gap: 0.25rem; padding: 0.625rem 0.875rem; }
    .brand-mark { display: flex; align-items: center; gap: 0.5rem; padding-right: 1rem; border-right: 1px solid rgba(124, 58, 237, 0.3); }
    .pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: #7c3aed; animation: pulseDot 2s ease-in-out infinite; }
    @keyframes pulseDot {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    .brand-text { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #a78bfa; text-transform: uppercase; }
    .stats-container { display: flex; align-items: center; gap: 1.25rem; padding-left: 0.75rem; }
    .stat-item { display: flex; align-items: center; gap: 0.75rem; }
    .stat-item.highlighted { padding: 0.375rem 0.625rem; border-radius: 0.375rem; background-color: rgba(124, 58, 237, 0.1); border: 1px solid rgba(124, 58, 237, 0.2); }
    .stat-icon { width: 14px; height: 14px; color: #a78bfa; }
    .icon-shadow { filter: drop-shadow(0 0 4px rgba(124, 58, 237, 0.5)); }
    .stat-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .stat-value { font-size: 1rem; font-weight: 700; color: white; line-height: 1; }
    .stat-value-sm { font-size: 0.875rem; }
    .text-shadow { text-shadow: 0 0 10px rgba(124, 58, 237, 0.4); }
    .stat-label { font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-totals { display: flex; gap: 0.35rem; font-size: 0.55rem; color: #e4e4e7; font-weight: 500; letter-spacing: 0.02em; margin-top: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .stat-today { color: #c4b5fd; font-weight: 600; }
    
    /* Corners with breathing */
    .corner { 
      position: absolute; width: 10px; height: 10px; 
      border-color: rgba(124, 58, 237, 0.7); border-style: solid;
      animation: cornerBreath 4s ease-in-out infinite;
    }
    @keyframes cornerBreath {
      0%, 100% { border-color: rgba(124, 58, 237, 0.5); }
      50% { border-color: rgba(124, 58, 237, 0.9); }
    }
    .top-left { top: -3px; left: -3px; border-width: 2px 0 0 2px; }
    .top-right { top: -3px; right: -3px; border-width: 2px 2px 0 0; }
    .bottom-left { bottom: -3px; left: -3px; border-width: 0 0 2px 2px; }
    .bottom-right { bottom: -3px; right: -3px; border-width: 0 2px 2px 0; }
  `]
})
export class OverlayLamej0r1Component implements OnInit {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy;
  constructor(private trackerService: TrackerService) { }
  ngOnInit() { this.snapshot$ = this.trackerService.getSnapshot('account2'); }
}
