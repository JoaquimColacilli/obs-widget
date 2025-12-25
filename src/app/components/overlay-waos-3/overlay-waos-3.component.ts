import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy, TrendingUp, TrendingDown, Crown, HeartCrack } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { OverlayStateService, OverlayDeltas } from '../../services/overlay-state.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay-waos-3',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-waos.png" class="cosmic-bg" alt="">
    <div class="animate-float">
        <div class="outer-container">
          <div class="glow-ring"></div>
          <div class="main-container breathing-border">
            <div class="header"><div class="header-content"><div class="header-line left"></div><div class="header-text-container"><span class="challenge-text">RETO YUNARA ABS</span><span class="nick-text">WAOS #kmu</span></div><div class="header-line right"></div></div></div>
            <div class="stats-grid-wrapper">
              <div class="stats-grid">
                <div class="glass-card">
                  <lucide-icon [img]="Skull" class="card-icon"></lucide-icon>
                  <div class="card-label-acc">Total acc</div>
                  <div class="card-value">{{ data.accountDeaths | number }}</div>
                  <div class="card-totals">Total: {{ data.totalDeaths | number }} · <span class="card-today">Hoy: {{ data.todayDeaths | number }}</span></div>
                  <div class="streak-carousel" *ngIf="deltas.showStreak && showWinrateCarousel"><div class="carousel-track"><div class="carousel-slide"><span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span><lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="7" class="streak-icon streak-win"></lucide-icon><lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="7" class="streak-icon streak-loss"></lucide-icon></div><div class="carousel-slide"><span class="winrate-text">{{ winrateText }}</span><lucide-icon *ngIf="isWinrateHigh" [img]="Crown" [size]="7" class="winrate-icon winrate-high"></lucide-icon><lucide-icon *ngIf="!isWinrateHigh" [img]="HeartCrack" [size]="7" class="winrate-icon winrate-low"></lucide-icon></div></div></div>
                  <div class="card-streak" *ngIf="deltas.showStreak && !showWinrateCarousel"><span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span><lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="7" class="streak-icon streak-win"></lucide-icon><lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="7" class="streak-icon streak-loss"></lucide-icon></div>
                </div>
                <div class="glass-card primary">
                  <lucide-icon [img]="Dumbbell" class="card-icon primary-icon"></lucide-icon>
                  <div class="card-label-acc">Total acc</div>
                  <div class="card-value primary-value">{{ data.accountAbs | number }}</div>
                  <div class="card-totals">Total: {{ data.totalAbs | number }} · <span class="card-today">Hoy: {{ data.todayAbs | number }}</span></div>
                  <div class="corner-accent"></div>
                  <div class="abs-toast" *ngIf="showAbsToast">+{{ absToastAmount }} ABS</div>
                </div>
                <div class="glass-card"><lucide-icon [img]="Calendar" class="card-icon"></lucide-icon><div class="card-value">{{ data.dayNumber }}</div><div class="card-label">DÍA</div></div>
                <div class="glass-card"><lucide-icon [img]="Trophy" class="card-icon"></lucide-icon><div class="card-value card-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</div><div class="card-label">{{ data.rank.lp }} LP<span class="lp-trend" *ngIf="deltas.showLpTrend" [class.up]="deltas.lpDelta > 0" [class.down]="deltas.lpDelta < 0">{{ deltas.lpTrendText }}</span></div><div class="rank-badge" *ngIf="showRankBadge" [class.up]="deltas.rankChangeDirection === 'up'" [class.down]="deltas.rankChangeDirection === 'down'">{{ deltas.rankChangeText }}</div></div>
              </div>
            </div>
            <div class="bottom-accent"></div>
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
    .cosmic-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.4; filter: blur(2px); border-radius: 1.5rem; z-index: 0; pointer-events: none; }
    .animate-float { position: relative; z-index: 1; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .breathing-border { animation: breathe 4s ease-in-out infinite; }
    @keyframes breathe { 0%, 100% { box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.15); } 50% { box-shadow: 0 0 8px 1px rgba(20, 184, 166, 0.3); } }
    .outer-container { position: relative; width: fit-content; }
    .glow-ring { position: absolute; inset: -4px; background: linear-gradient(to right, rgba(20, 184, 166, 0.3), rgba(94, 234, 212, 0.3)); border-radius: 1.5rem; filter: blur(12px); animation: glowPulse 4s ease-in-out infinite; }
    @keyframes glowPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
    .main-container { position: relative; background-color: rgba(9, 9, 11, 0.3); backdrop-filter: blur(12px); border-radius: 1.5rem; border: 1px solid rgba(20, 184, 166, 0.25); overflow: hidden; min-width: 340px; }
    .header { padding: 1.125rem 1.5rem; background: linear-gradient(to right, rgba(20, 184, 166, 0.08), rgba(94, 234, 212, 0.08)); }
    .header-content { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .header-line { height: 1px; flex: 1; }
    .header-line.left { background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.5)); }
    .header-line.right { background: linear-gradient(to left, transparent, rgba(20, 184, 166, 0.5)); }
    .header-text-container { display: flex; flex-direction: column; align-items: center; gap: 0.125rem; }
    .challenge-text { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.2em; color: #99f6e4; text-transform: uppercase; }
    .nick-text { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.1em; color: white; text-transform: uppercase; }
    .stats-grid-wrapper { padding: 1rem 1.25rem 1.5rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .glass-card { position: relative; padding: 0.875rem 1rem; border-radius: 0.875rem; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); }
    .glass-card.primary { background: linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(94, 234, 212, 0.18) 100%); border: 1.5px solid rgba(20, 184, 166, 0.5); }
    .card-icon { width: 1.125rem; height: 1.125rem; color: #71717a; margin-bottom: 0.5rem; display: block; }
    .primary-icon { color: #5eead4; filter: drop-shadow(0 0 8px rgba(20, 184, 166, 0.6)); }
    .card-value { font-size: 1.875rem; font-weight: 700; line-height: 1; margin-bottom: 0.25rem; color: white; }
    .card-value-sm { font-size: 1.375rem; }
    .primary-value { color: #ccfbf1; text-shadow: 0 0 20px rgba(20, 184, 166, 0.5); }
    .card-label { font-size: 0.625rem; text-transform: uppercase; color: #71717a; display: flex; align-items: center; gap: 0.25rem; }
    .card-label-acc { font-size: 0.5rem; text-transform: uppercase; color: #a1a1aa; margin-bottom: 2px; }
    .card-totals { display: flex; gap: 0.35rem; font-size: 0.55rem; color: #e4e4e7; }
    .card-today { color: #99f6e4; font-weight: 600; }
    .card-streak { display: flex; align-items: center; gap: 3px; margin-top: 3px; }
    .streak-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }\n    .streak-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .streak-win { color: #22c55e; }
    .streak-loss { color: #ef4444; }
    .streak-win-text { font-size: 0.5rem; font-weight: 600; color: #22c55e; }
    .streak-loss-text { font-size: 0.5rem; font-weight: 600; color: #ef4444; }
    .streak-carousel { overflow: hidden; width: 100%; height: 0.7rem; position: relative; margin-top: 3px; }
    .carousel-track { display: flex; flex-direction: row; width: 200%; animation: streakCarousel 12.6s ease-in-out infinite; }
    .carousel-slide { display: flex; align-items: center; gap: 3px; width: 50%; flex-shrink: 0; }
    .winrate-text { font-size: 0.5rem; font-weight: 600; color: #99f6e4; }
    .winrate-icon { width: 7px !important; height: 7px !important; flex-shrink: 0; display: inline-flex !important; }
    .winrate-icon svg { width: 7px !important; height: 7px !important; }
    .winrate-high { color: #fbbf24; }
    .winrate-low { color: #f87171; }
    @keyframes streakCarousel { 0%, 63.5% { transform: translateX(0); } 66% { transform: translateX(-50%); } 97.6% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
    .corner-accent { position: absolute; top: 6px; right: 6px; width: 10px; height: 10px; border-top: 1px solid rgba(94, 234, 212, 0.6); border-right: 1px solid rgba(94, 234, 212, 0.6); border-top-right-radius: 3px; }
    .bottom-accent { height: 4px; background: linear-gradient(to right, transparent, rgba(20, 184, 166, 0.5), transparent); }
    .lp-trend { font-size: 8px; font-weight: 600; }
    .lp-trend.up { color: #4ade80; }
    .lp-trend.down { color: #f87171; }
    .rank-badge { position: absolute; top: 6px; left: 6px; font-size: 7px; font-weight: 700; padding: 2px 4px; border-radius: 3px; }
    .rank-badge.up { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.5); }
    .rank-badge.down { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.5); }
    .abs-toast { position: absolute; top: 6px; right: 24px; font-size: 9px; font-weight: 700; color: #5eead4; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.4); padding: 2px 5px; border-radius: 4px; animation: absToastAnim 1s ease-out forwards; z-index: 10; pointer-events: none; }
    @keyframes absToastAnim { 0% { opacity: 0; transform: translateY(8px) scale(0.8); } 15% { opacity: 1; transform: translateY(0) scale(1); } 85% { opacity: 1; } 100% { opacity: 0; } }
  `]
})
export class OverlayWaos3Component implements OnInit, OnDestroy {
  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy; TrendingUp = TrendingUp; TrendingDown = TrendingDown;
  Crown = Crown; HeartCrack = HeartCrack;
  deltas: OverlayDeltas = { deltaDeaths: 0, lpDelta: 0, showLpTrend: false, lpTrendText: '', showRankChange: false, rankChangeText: '', rankChangeDirection: null, shouldShowAbsToast: false, absToastAmount: 0, showStreak: false, streakType: null, streakCount: 0, streakText: '' };
  showAbsToast = false; absToastAmount = 0; showRankBadge = false;
  winrateText: string = ''; showWinrateCarousel: boolean = false; isWinrateHigh: boolean = true;
  private toastTimeout?: any; private rankBadgeTimeout?: any;
  constructor(private trackerService: TrackerService, private overlayStateService: OverlayStateService) { }
  ngOnInit() {
    const overlayId = 'waos-3-account3';
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

