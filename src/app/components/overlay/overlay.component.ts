import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy, TrendingUp, TrendingDown, Crown, HeartCrack } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { OverlayStateService, OverlayDeltas } from '../../services/overlay-state.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-yunara.png" class="cosmic-bg" alt="">
    <div class="particle p1"></div><div class="particle p2"></div><div class="particle p3"></div><div class="particle p4"></div><div class="particle p5"></div>
    <div class="sparkle s1"></div><div class="sparkle s2"></div><div class="sparkle s3"></div><div class="sparkle s4"></div>
    <div class="animate-float">
        <div class="container-hud breathing-border">
          <div class="gradient-line-top"></div>
          <div class="content-row">
            <div class="brand-mark">
              <div class="pulse-dot"></div>
              <span class="brand-text">{{ brandName }}</span>
            </div>
            <div class="stats-container">
              <div class="stat-item">
                <lucide-icon [img]="Skull" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content">
                  <span class="stat-label-acc">Total acc</span>
                  <span class="stat-value text-shadow">{{ data.accountDeaths | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalDeaths | number }} · <span class="stat-today">Hoy: {{ data.todayDeaths | number }}</span></span>
                  <!-- Streak/Winrate Carousel (horizontal slide) -->
                  <div class="streak-carousel" *ngIf="deltas.showStreak && showWinrateCarousel">
                    <div class="carousel-track">
                      <!-- Streak -->
                      <div class="carousel-slide">
                        <span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span>
                        <lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="8" class="streak-icon streak-win"></lucide-icon>
                        <lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="8" class="streak-icon streak-loss"></lucide-icon>
                      </div>
                      <!-- Winrate -->
                      <div class="carousel-slide">
                        <span class="winrate-text">{{ winrateText }}</span>
                        <lucide-icon *ngIf="isWinrateHigh" [img]="Crown" [size]="8" class="winrate-icon winrate-high"></lucide-icon>
                        <lucide-icon *ngIf="!isWinrateHigh" [img]="HeartCrack" [size]="8" class="winrate-icon winrate-low"></lucide-icon>
                      </div>
                    </div>
                  </div>
                  <!-- Fallback: static streak (not enough matches for winrate) -->
                  <div class="stat-streak" *ngIf="deltas.showStreak && !showWinrateCarousel">
                    <span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span>
                    <lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="8" class="streak-icon streak-win"></lucide-icon>
                    <lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="8" class="streak-icon streak-loss"></lucide-icon>
                  </div>
                </div>
              </div>
              <div class="stat-item highlighted">
                <lucide-icon [img]="Dumbbell" class="stat-icon icon-shadow"></lucide-icon>
                <div class="stat-content stat-content-relative">
                  <span class="stat-label-acc">Total acc</span>
                  <span class="stat-value text-shadow">{{ data.accountAbs | number }}</span>
                  <span class="stat-totals">Total: {{ data.totalAbs | number }} · <span class="stat-today">Hoy: {{ data.todayAbs | number }}</span></span>
                  <!-- ABS Toast -->
                  <div class="abs-toast" *ngIf="showAbsToast">+{{ absToastAmount }} ABS</div>
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
                  <span class="stat-label">
                    {{ data.rank.lp }} LP
                    <span class="lp-trend" *ngIf="deltas.showLpTrend" [class.up]="deltas.lpDelta > 0" [class.down]="deltas.lpDelta < 0">{{ deltas.lpTrendText }}</span>
                  </span>
                  <!-- Rank Change Badge -->
                  <div class="rank-badge" *ngIf="showRankBadge" [class.up]="deltas.rankChangeDirection === 'up'" [class.down]="deltas.rankChangeDirection === 'down'">
                    {{ deltas.rankChangeText }}
                  </div>
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
    .cosmic-bg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.4; filter: blur(2px);
      border-radius: 0.75rem; z-index: 0;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
      pointer-events: none;
    }
    .particle { position: absolute; width: 3px; height: 3px; background: #f472b6; border-radius: 50%; opacity: 0.2; pointer-events: none; z-index: 2; }
    .p1 { top: 15%; left: 10%; animation: floatParticle 8s ease-in-out infinite; }
    .p2 { top: 60%; left: 85%; animation: floatParticle 7s ease-in-out infinite 1s; }
    .p3 { top: 30%; left: 50%; animation: floatParticle 9s ease-in-out infinite 2s; }
    .p4 { top: 75%; left: 25%; animation: floatParticle 6s ease-in-out infinite 3s; }
    .p5 { top: 45%; left: 70%; animation: floatParticle 10s ease-in-out infinite 4s; }
    @keyframes floatParticle { 0%, 100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-12px); opacity: 0.35; } }
    .sparkle { position: absolute; width: 8px; height: 8px; opacity: 0; pointer-events: none; z-index: 3; }
    .sparkle::before, .sparkle::after { content: ''; position: absolute; background: #f472b6; }
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
    @keyframes breathe { 0%, 100% { box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.15); } 50% { box-shadow: 0 0 8px 1px rgba(236, 72, 153, 0.3); } }
    .container-hud { position: relative; background-color: rgba(9, 9, 11, 0.3); backdrop-filter: blur(8px); border-radius: 0.75rem; overflow: hidden; }
    .gradient-line-top { height: 2px; background: linear-gradient(to right, #ec4899, #a855f7, #ec4899); }
    .gradient-line-bottom { height: 2px; background: linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), transparent); }
    .content-row { display: flex; align-items: center; gap: 0.25rem; padding: 0.625rem 0.875rem; }
    .brand-mark { display: flex; align-items: center; gap: 0.5rem; padding-right: 1rem; border-right: 1px solid rgba(236, 72, 153, 0.3); }
    .pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: #ec4899; animation: pulseDot 2s ease-in-out infinite; }
    @keyframes pulseDot { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    .brand-text { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #f472b6; text-transform: uppercase; }
    .stats-container { display: flex; align-items: center; gap: 1.25rem; padding-left: 0.75rem; }
    .stat-item { display: flex; align-items: center; gap: 0.75rem; }
    .stat-item.highlighted { padding: 0.375rem 0.625rem; border-radius: 0.375rem; background-color: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.2); }
    .stat-icon { width: 14px; height: 14px; color: #f472b6; }
    .icon-shadow { filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.5)); }
    .stat-content { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .stat-content-relative { position: relative; }
    .stat-value { font-size: 1rem; font-weight: 700; color: white; line-height: 1; }
    .stat-value-sm { font-size: 0.875rem; }
    .text-shadow { text-shadow: 0 0 10px rgba(236, 72, 153, 0.4); }
    .stat-label { font-size: 9px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.25rem; }
    .stat-label-acc { font-size: 7px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 1px; }
    .stat-totals { display: flex; gap: 0.35rem; font-size: 0.5rem; color: #e4e4e7; font-weight: 500; letter-spacing: 0.02em; margin-top: 1px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .stat-today { color: #f0abfc; font-weight: 600; }
    
    /* Streak with icon on right */
    .stat-streak { display: flex; align-items: center; gap: 3px; margin-top: 2px; }
    .streak-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }
    .streak-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .streak-win { color: #22c55e; }
    .streak-loss { color: #ef4444; }
    .streak-win-text { font-size: 0.45rem; font-weight: 600; color: #22c55e; }
    .streak-loss-text { font-size: 0.45rem; font-weight: 600; color: #ef4444; }
    
    /* Streak/Winrate Carousel - Horizontal sliding animation */
    .streak-carousel {
      overflow: hidden;
      width: 100%;
      height: 0.65rem;
      position: relative;
      margin-top: 2px;
    }
    .carousel-track {
      display: flex;
      flex-direction: row;
      width: 200%;
      animation: streakCarousel 12.6s ease-in-out infinite;
    }
    .carousel-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      width: 50%;
      flex-shrink: 0;
    }
    .winrate-text {
      font-size: 0.45rem;
      font-weight: 600;
      color: #f0abfc;
    }
    .winrate-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }
    .winrate-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .winrate-high { color: #fbbf24; }
    .winrate-low { color: #f87171; }
    @keyframes streakCarousel {
      /* Streak visible: 0s - 8s (63.5%) */
      0%, 63.5% { transform: translateX(0); }
      /* Transition to winrate: 8s - 8.3s */
      66% { transform: translateX(-50%); }
      /* Winrate visible: 8.3s - 12.3s (97.6%) */
      97.6% { transform: translateX(-50%); }
      /* Transition back to streak */
      100% { transform: translateX(0); }
    }
    
    .corner { position: absolute; width: 10px; height: 10px; border-color: rgba(236, 72, 153, 0.7); border-style: solid; animation: cornerBreath 4s ease-in-out infinite; }
    @keyframes cornerBreath { 0%, 100% { border-color: rgba(236, 72, 153, 0.5); } 50% { border-color: rgba(236, 72, 153, 0.9); } }
    .top-left { top: -3px; left: -3px; border-width: 2px 0 0 2px; }
    .top-right { top: -3px; right: -3px; border-width: 2px 2px 0 0; }
    .bottom-left { bottom: -3px; left: -3px; border-width: 0 0 2px 2px; }
    .bottom-right { bottom: -3px; right: -3px; border-width: 0 2px 2px 0; }

    /* LP Trend */
    .lp-trend { font-size: 8px; font-weight: 600; margin-left: 4px; }
    .lp-trend.up { color: #4ade80; }
    .lp-trend.down { color: #f87171; }

    /* Rank Badge */
    .rank-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 7px;
      font-weight: 700;
      padding: 2px 4px;
      border-radius: 3px;
      animation: rankBadgePulse 0.5s ease-out;
      white-space: nowrap;
    }
    .rank-badge.up { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.5); }
    .rank-badge.down { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.5); }
    @keyframes rankBadgePulse { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    /* ABS Toast */
    .abs-toast {
      position: absolute;
      top: -20px;
      right: -10px;
      font-size: 10px;
      font-weight: 700;
      color: #f472b6;
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.4);
      padding: 2px 6px;
      border-radius: 4px;
      animation: absToastAnim 1s ease-out forwards;
      white-space: nowrap;
      z-index: 10;
      pointer-events: none;
    }
    @keyframes absToastAnim {
      0% { opacity: 0; transform: translateY(10px) scale(0.8); }
      15% { opacity: 1; transform: translateY(0) scale(1); }
      85% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-10px) scale(0.9); }
    }
  `]
})
export class OverlayComponent implements OnInit, OnDestroy {
  @Input() account: string = 'account1';
  @Input() brandName: string = 'YUNARA LITERAL #abs';

  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy;
  TrendingUp = TrendingUp; TrendingDown = TrendingDown;
  Crown = Crown; HeartCrack = HeartCrack;

  // State
  deltas: OverlayDeltas = {
    deltaDeaths: 0, lpDelta: 0, showLpTrend: false, lpTrendText: '',
    showRankChange: false, rankChangeText: '', rankChangeDirection: null,
    shouldShowAbsToast: false, absToastAmount: 0, showStreak: false,
    streakType: null, streakCount: 0, streakText: ''
  };

  showAbsToast = false;
  absToastAmount = 0;
  showRankBadge = false;

  // Winrate carousel
  winrateText: string = '';
  showWinrateCarousel: boolean = false;
  isWinrateHigh: boolean = true;

  private subscription?: Subscription;
  private toastTimeout?: any;
  private rankBadgeTimeout?: any;

  constructor(
    private trackerService: TrackerService,
    private overlayStateService: OverlayStateService
  ) { }

  ngOnInit() {
    const overlayId = `yunara-1-${this.account}`;

    this.snapshot$ = this.trackerService.getSnapshot(this.account).pipe(
      tap(snapshot => {
        this.deltas = this.overlayStateService.processSnapshot(overlayId, snapshot);

        // Handle ABS toast
        if (this.deltas.shouldShowAbsToast) {
          this.showAbsToast = true;
          this.absToastAmount = this.deltas.absToastAmount;

          if (this.toastTimeout) clearTimeout(this.toastTimeout);
          this.toastTimeout = setTimeout(() => {
            this.showAbsToast = false;
          }, 1000);
        }

        // Handle rank badge (show for 10s)
        if (this.deltas.showRankChange) {
          this.showRankBadge = true;

          if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout);
          this.rankBadgeTimeout = setTimeout(() => {
            this.showRankBadge = false;
          }, 10000);
        }

        // Calculate winrate for carousel (using official Riot API data)
        const winrateResult = this.calculateWinrate(snapshot.rank.wins, snapshot.rank.losses);
        this.winrateText = winrateResult.text;
        this.showWinrateCarousel = winrateResult.showCarousel;
        this.isWinrateHigh = winrateResult.winrateValue >= 50;
      })
    );
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout);
  }

  private calculateWinrate(wins: number, losses: number): { text: string; showCarousel: boolean; winrateValue: number } {
    const totalGames = wins + losses;
    if (totalGames < 3) {
      return { text: '', showCarousel: false, winrateValue: 0 };
    }
    const wr = Math.round((wins / totalGames) * 100);
    return { text: `${wr}% WR`, showCarousel: true, winrateValue: wr };
  }
}
