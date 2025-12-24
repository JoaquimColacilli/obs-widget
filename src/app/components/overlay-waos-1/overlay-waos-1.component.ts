import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy, TrendingUp, TrendingDown } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { OverlayStateService, OverlayDeltas } from '../../services/overlay-state.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay-waos-1',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-waos.png" class="cosmic-bg" alt="">
    <div class="animate-float">
        <div class="container-hud breathing-border">
          <div class="gradient-line-top"></div>
          <div class="content-row">
            <div class="brand-mark"><div class="pulse-dot"></div><span class="brand-text">WAOS #kmu</span></div>
            <div class="stats-container">
              <div class="stat-item">
                <lucide-icon [img]="Skull" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-label-acc">Total acc</span>
                  <span class="stat-value text-shadow">{{ data.accountDeaths | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalDeaths | number }} · <span class="stat-today">Hoy: {{ data.todayDeaths | number }}</span></span>
                  <div class="stat-streak" *ngIf="deltas.showStreak"><span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span><lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="6" class="streak-icon streak-win"></lucide-icon><lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="6" class="streak-icon streak-loss"></lucide-icon></div>
                </div>
              </div>
              <div class="stat-item highlighted">
                <lucide-icon [img]="Dumbbell" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content stat-content-relative">
                  <span class="stat-label-acc">Total acc</span>
                  <span class="stat-value text-shadow">{{ data.accountAbs | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalAbs | number }} · <span class="stat-today">Hoy: {{ data.todayAbs | number }}</span></span>
                  <div class="abs-toast" *ngIf="showAbsToast">+{{ absToastAmount }} ABS</div>
                </div>
              </div>
              <div class="stat-item"><lucide-icon [img]="Calendar" class="stat-icon icon-shadow"></lucide-icon><div class="stat-content"><span class="stat-value text-shadow">{{ data.dayNumber }}</span><span class="stat-label">DÍA</span></div></div>
              <div class="stat-item"><lucide-icon [img]="Trophy" class="stat-icon icon-shadow"></lucide-icon><div class="stat-content"><span class="stat-value stat-value-sm text-shadow">{{ data.rank.tier }} {{ data.rank.division }}</span><span class="stat-label">{{ data.rank.lp }} LP<span class="lp-trend" *ngIf="deltas.showLpTrend" [class.up]="deltas.lpDelta > 0" [class.down]="deltas.lpDelta < 0">{{ deltas.lpTrendText }}</span></span><div class="rank-badge" *ngIf="showRankBadge" [class.up]="deltas.rankChangeDirection === 'up'" [class.down]="deltas.rankChangeDirection === 'down'">{{ deltas.rankChangeText }}</div></div></div>
            </div>
          </div>
          <div class="gradient-line-bottom"></div>
        </div>
        <div class="corner top-left"></div><div class="corner top-right"></div><div class="corner bottom-left"></div><div class="corner bottom-right"></div>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host { display: inline-block; }
    .overlay-wrapper { display: inline-block; font-family: 'Inter', system-ui, sans-serif; }
    .overlay-container { position: relative; padding: 0.1rem; }
    .cosmic-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; filter: blur(2px); border-radius: 0.75rem; z-index: 0; pointer-events: none; }
    .animate-float { position: relative; z-index: 1; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .breathing-border { animation: breathe 4s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.15); } 50% { box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.3); } }
    .container-hud { position: relative; background-color: rgba(9, 9, 11, 0.3); backdrop-filter: blur(8px); border-radius: 0.75rem; overflow: hidden; }
    .gradient-line-top { height: 2px; background: linear-gradient(to right, #14b8a6, #5eead4, #14b8a6); }
    .gradient-line-bottom { height: 2px; background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.5), transparent); }
    .content-row { display: flex; align-items: center; gap: 0.25rem; padding: 0.625rem 0.875rem; }
    .brand-mark { display: flex; align-items: center; gap: 0.5rem; padding-right: 1rem; border-right: 1px solid rgba(20, 184, 166, 0.3); }
    .pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: #14b8a6; animation: pulseDot 2s ease-in-out infinite; }
    @keyframes pulseDot { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    .brand-text { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #5eead4; text-transform: uppercase; }
    .stats-container { display: flex; align-items: center; gap: 1.25rem; padding-left: 0.75rem; }
    .stat-item { display: flex; align-items: center; gap: 0.75rem; }
    .stat-item.highlighted { padding: 0.375rem 0.625rem; border-radius: 0.375rem; background-color: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.2); }
    .stat-icon { width: 14px; height: 14px; color: #5eead4; }
    .icon-shadow { filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.5)); }
    .stat-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .stat-content-relative { position: relative; }
    .stat-value { font-size: 1rem; font-weight: 700; color: white; line-height: 1; }
    .stat-value-sm { font-size: 0.875rem; }
    .text-shadow { text-shadow: 0 0 10px rgba(20, 184, 166, 0.4); }
    .stat-label { font-size: 9px; color: #71717a; text-transform: uppercase; display: flex; align-items: center; gap: 0.25rem; }
    .stat-label-acc { font-size: 7px; color: #a1a1aa; text-transform: uppercase; margin-top: 1px; }
    .stat-totals { display: flex; gap: 0.35rem; font-size: 0.5rem; color: #e4e4e7; margin-top: 1px; }
    .stat-today { color: #99f6e4; font-weight: 600; }
    .stat-streak { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
    .streak-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }\n    .streak-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .streak-win { color: #22c55e; }
    .streak-loss { color: #ef4444; }
    .streak-win-text { font-size: 0.45rem; font-weight: 600; color: #22c55e; }
    .streak-loss-text { font-size: 0.45rem; font-weight: 600; color: #ef4444; }
    .corner { position: absolute; width: 10px; height: 10px; border-color: rgba(20, 184, 166, 0.7); border-style: solid; }
    .top-left { top: -3px; left: -3px; border-width: 2px 0 0 2px; }
    .top-right { top: -3px; right: -3px; border-width: 2px 2px 0 0; }
    .bottom-left { bottom: -3px; left: -3px; border-width: 0 0 2px 2px; }
    .bottom-right { bottom: -3px; right: -3px; border-width: 0 2px 2px 0; }
    .lp-trend { font-size: 8px; font-weight: 600; }
    .lp-trend.up { color: #4ade80; }
    .lp-trend.down { color: #f87171; }
    .rank-badge { position: absolute; top: -8px; right: -8px; font-size: 7px; font-weight: 700; padding: 2px 4px; border-radius: 3px; }
    .rank-badge.up { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.5); }
    .rank-badge.down { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.5); }
    .abs-toast { position: absolute; top: -20px; right: -10px; font-size: 10px; font-weight: 700; color: #5eead4; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.4); padding: 2px 6px; border-radius: 4px; animation: absToastAnim 1s ease-out forwards; z-index: 10; pointer-events: none; }
    @keyframes absToastAnim { 0% { opacity: 0; transform: translateY(10px) scale(0.8); } 15% { opacity: 1; transform: translateY(0) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; } }
  `]
})
export class OverlayWaos1Component implements OnInit, OnDestroy {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy; TrendingUp = TrendingUp; TrendingDown = TrendingDown;
  deltas: OverlayDeltas = { deltaDeaths: 0, lpDelta: 0, showLpTrend: false, lpTrendText: '', showRankChange: false, rankChangeText: '', rankChangeDirection: null, shouldShowAbsToast: false, absToastAmount: 0, showStreak: false, streakType: null, streakCount: 0, streakText: '' };
  showAbsToast = false; absToastAmount = 0; showRankBadge = false;
  private toastTimeout?: any; private rankBadgeTimeout?: any;
  constructor(private trackerService: TrackerService, private overlayStateService: OverlayStateService) { }
  ngOnInit() {
    const overlayId = 'waos-1-account3';
    this.snapshot$ = this.trackerService.getSnapshot('account3').pipe(tap(snapshot => {
      this.deltas = this.overlayStateService.processSnapshot(overlayId, snapshot);
      if (this.deltas.shouldShowAbsToast) { this.showAbsToast = true; this.absToastAmount = this.deltas.absToastAmount; if (this.toastTimeout) clearTimeout(this.toastTimeout); this.toastTimeout = setTimeout(() => { this.showAbsToast = false; }, 1000); }
      if (this.deltas.showRankChange) { this.showRankBadge = true; if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout); this.rankBadgeTimeout = setTimeout(() => { this.showRankBadge = false; }, 10000); }
    }));
  }
  ngOnDestroy() { if (this.toastTimeout) clearTimeout(this.toastTimeout); if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout); }
}
