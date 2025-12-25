import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy, TrendingUp, TrendingDown, Crown, HeartCrack } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { OverlayStateService, OverlayDeltas } from '../../services/overlay-state.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay-waos-2',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-waos.png" class="cosmic-bg" alt="">
    <div class="animate-float">
        <div class="vertical-container breathing-border">
          <div class="header">
            <div class="header-top"><div class="pulse-dot"></div><span class="challenge-text">RETO YUNARA ABS</span></div>
            <span class="nick-text">WAOS #kmu</span>
          </div>
          <div class="stat-row">
            <div class="stat-left"><lucide-icon [img]="Skull" class="stat-icon"></lucide-icon><span class="stat-label">Muertes</span></div>
            <div class="stat-right">
              <span class="stat-label-acc">Total acc</span>
              <span class="stat-value">{{ data.accountDeaths | number }}</span>
              <span class="stat-totals">Total: {{ data.totalDeaths | number }} · <span class="stat-today">Hoy: {{ data.todayDeaths | number }}</span></span>
              <div class="streak-carousel" *ngIf="deltas.showStreak && showWinrateCarousel"><div class="carousel-track"><div class="carousel-slide"><span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span><lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="6" class="streak-icon streak-win"></lucide-icon><lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="6" class="streak-icon streak-loss"></lucide-icon></div><div class="carousel-slide"><span class="winrate-text">{{ winrateText }}</span><lucide-icon *ngIf="isWinrateHigh" [img]="Crown" [size]="6" class="winrate-icon winrate-high"></lucide-icon><lucide-icon *ngIf="!isWinrateHigh" [img]="HeartCrack" [size]="6" class="winrate-icon winrate-low"></lucide-icon></div></div></div>
              <div class="stat-streak" *ngIf="deltas.showStreak && !showWinrateCarousel"><span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span><lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="6" class="streak-icon streak-win"></lucide-icon><lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="6" class="streak-icon streak-loss"></lucide-icon></div>
            </div>
          </div>
          <div class="stat-row featured">
            <div class="stat-left"><lucide-icon [img]="Dumbbell" class="stat-icon featured-icon"></lucide-icon><span class="stat-label">Abdominales</span></div>
            <div class="stat-right stat-right-relative">
              <span class="stat-label-acc">Total acc</span>
              <span class="stat-value featured-value">{{ data.accountAbs | number }}</span>
              <span class="stat-totals">Total: {{ data.totalAbs | number }} · <span class="stat-today">Hoy: {{ data.todayAbs | number }}</span></span>
              <div class="abs-toast" *ngIf="showAbsToast">+{{ absToastAmount }} ABS</div>
            </div>
          </div>
          <div class="stat-row"><div class="stat-left"><lucide-icon [img]="Calendar" class="stat-icon"></lucide-icon><span class="stat-label">Día</span></div><span class="stat-value">{{ data.dayNumber }}</span></div>
          <div class="stat-row"><div class="stat-left"><lucide-icon [img]="Trophy" class="stat-icon"></lucide-icon><span class="stat-label">{{ data.rank.lp }} LP<span class="lp-trend" *ngIf="deltas.showLpTrend" [class.up]="deltas.lpDelta > 0" [class.down]="deltas.lpDelta < 0">{{ deltas.lpTrendText }}</span></span></div><div class="stat-value-wrapper"><span class="stat-value stat-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</span><div class="rank-badge" *ngIf="showRankBadge" [class.up]="deltas.rankChangeDirection === 'up'" [class.down]="deltas.rankChangeDirection === 'down'">{{ deltas.rankChangeText }}</div></div></div>
        </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    :host { display: block; }
    .overlay-wrapper { display: inline-block; font-family: 'Inter', system-ui, sans-serif; }
    .overlay-container { position: relative; padding: 0.1rem; }
    .cosmic-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3; filter: blur(5px); border-radius: 0.75rem; z-index: 0; pointer-events: none; }
    .animate-float { position: relative; z-index: 1; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .breathing-border { animation: breathe 4s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.15); } 50% { box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.3); } }
    .vertical-container { display: flex; flex-direction: column; gap: 0.375rem; width: 15.5rem; overflow: hidden; }
    .header { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0.75rem; background: linear-gradient(to right, rgba(20, 184, 166, 0.2), rgba(94, 234, 212, 0.2)); border-radius: 0.5rem; border: 1px solid rgba(20, 184, 166, 0.3); }
    .header-top { display: flex; align-items: center; gap: 0.5rem; }
    .pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: #14b8a6; animation: pulseDot 2s ease-in-out infinite; }
    @keyframes pulseDot { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    .challenge-text { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; color: #99f6e4; text-transform: uppercase; }
    .nick-text { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.05em; color: white; text-transform: uppercase; }
    .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgba(24, 24, 27, 0.8); border: 1px solid rgba(39, 39, 42, 0.5); overflow: hidden; }
    .stat-row.featured { background: linear-gradient(to right, rgba(20, 184, 166, 0.15), rgba(94, 234, 212, 0.15)); border: 1px solid rgba(20, 184, 166, 0.3); }
    .stat-left { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .stat-right { display: flex; flex-direction: column; align-items: flex-end; min-width: 0; }
    .stat-right-relative { position: relative; }
    .stat-icon { width: 1rem; height: 1rem; color: #a1a1aa; display: block; flex-shrink: 0; }
    .featured-icon { color: #5eead4; filter: drop-shadow(0 0 6px rgba(20, 184, 166, 0.6)); }
    .stat-label { display: flex; align-items: center; font-size: 9px; color: #a1a1aa; text-transform: uppercase; white-space: nowrap; gap: 0.2rem; }
    .stat-label-acc { font-size: 7px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.03em; font-weight: 500; }
    .stat-value { font-size: 1.125rem; font-weight: 700; color: white; }
    .stat-value-sm { font-size: 0.875rem; }
    .stat-value-wrapper { position: relative; display: flex; flex-direction: column; align-items: flex-end; }
    .stat-totals { font-size: 0.5rem; color: #e4e4e7; margin-top: 1px; white-space: nowrap; }
    .stat-today { color: #99f6e4; font-weight: 600; }
    .stat-streak { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
    .streak-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }\n    .streak-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .streak-win { color: #22c55e; }
    .streak-loss { color: #ef4444; }
    .streak-win-text { font-size: 0.45rem; font-weight: 600; color: #22c55e; }
    .streak-loss-text { font-size: 0.45rem; font-weight: 600; color: #ef4444; }
    .streak-carousel { overflow: hidden; width: 100%; height: 0.65rem; position: relative; margin-top: 2px; }
    .carousel-track { display: flex; flex-direction: row; width: 200%; animation: streakCarousel 12.6s ease-in-out infinite; }
    .carousel-slide { display: flex; align-items: center; justify-content: flex-end; gap: 3px; width: 50%; flex-shrink: 0; }
    .winrate-text { font-size: 0.45rem; font-weight: 600; color: #99f6e4; }
    .winrate-icon { width: 6px !important; height: 6px !important; flex-shrink: 0; display: inline-flex !important; }
    .winrate-icon svg { width: 6px !important; height: 6px !important; }
    .winrate-high { color: #fbbf24; }
    .winrate-low { color: #f87171; }
    @keyframes streakCarousel { 0%, 63.5% { transform: translateX(0); } 66% { transform: translateX(-50%); } 97.6% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
    .featured-value { color: #99f6e4; text-shadow: 0 0 15px rgba(20, 184, 166, 0.5); }
    .lp-trend { font-size: 7px; font-weight: 600; }
    .lp-trend.up { color: #4ade80; }
    .lp-trend.down { color: #f87171; }
    .rank-badge { font-size: 6px; font-weight: 700; padding: 1px 3px; border-radius: 2px; margin-top: 2px; white-space: nowrap; }
    .rank-badge.up { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.5); }
    .rank-badge.down { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.5); }
    .abs-toast { position: absolute; top: -14px; right: 0; font-size: 8px; font-weight: 700; color: #5eead4; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.4); padding: 1px 4px; border-radius: 3px; animation: absToastAnim 1s ease-out forwards; z-index: 10; pointer-events: none; }
    @keyframes absToastAnim { 0% { opacity: 0; transform: translateY(8px) scale(0.8); } 15% { opacity: 1; transform: translateY(0) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; } }
  `]
})
export class OverlayWaos2Component implements OnInit, OnDestroy {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy; TrendingUp = TrendingUp; TrendingDown = TrendingDown;
  Crown = Crown; HeartCrack = HeartCrack;
  deltas: OverlayDeltas = { deltaDeaths: 0, lpDelta: 0, showLpTrend: false, lpTrendText: '', showRankChange: false, rankChangeText: '', rankChangeDirection: null, shouldShowAbsToast: false, absToastAmount: 0, showStreak: false, streakType: null, streakCount: 0, streakText: '' };
  showAbsToast = false; absToastAmount = 0; showRankBadge = false;
  winrateText: string = ''; showWinrateCarousel: boolean = false; isWinrateHigh: boolean = true;
  private toastTimeout?: any; private rankBadgeTimeout?: any;
  constructor(private trackerService: TrackerService, private overlayStateService: OverlayStateService) { }
  ngOnInit() {
    const overlayId = 'waos-2-account3';
    this.snapshot$ = this.trackerService.getSnapshot('account3').pipe(tap(snapshot => {
      this.deltas = this.overlayStateService.processSnapshot(overlayId, snapshot);
      if (this.deltas.shouldShowAbsToast) { this.showAbsToast = true; this.absToastAmount = this.deltas.absToastAmount; if (this.toastTimeout) clearTimeout(this.toastTimeout); this.toastTimeout = setTimeout(() => { this.showAbsToast = false; }, 1000); }
      if (this.deltas.showRankChange) { this.showRankBadge = true; if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout); this.rankBadgeTimeout = setTimeout(() => { this.showRankBadge = false; }, 10000); }
      const wr = this.calculateWinrate(snapshot.rank.wins, snapshot.rank.losses);
      this.winrateText = wr.text; this.showWinrateCarousel = wr.showCarousel; this.isWinrateHigh = wr.winrateValue >= 50;
    }));
  }
  ngOnDestroy() { if (this.toastTimeout) clearTimeout(this.toastTimeout); if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout); }
  private calculateWinrate(wins: number, losses: number): { text: string; showCarousel: boolean; winrateValue: number } {
    const totalGames = wins + losses;
    if (totalGames < 3) return { text: '', showCarousel: false, winrateValue: 0 };
    const wr = Math.round((wins / totalGames) * 100);
    return { text: `${wr}% WR`, showCarousel: true, winrateValue: wr };
  }
}

