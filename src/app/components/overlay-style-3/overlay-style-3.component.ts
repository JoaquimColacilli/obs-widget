import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Skull, Dumbbell, Calendar, Trophy, TrendingUp, TrendingDown, Crown, HeartCrack } from 'lucide-angular';
import { TrackerService } from '../../services/tracker.service';
import { OverlayStateService, OverlayDeltas } from '../../services/overlay-state.service';
import { Snapshot } from '../../models/snapshot.model';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-overlay-style-3',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
<div class="overlay-wrapper" *ngIf="snapshot$ | async as data">
  <div class="overlay-container">
    <img src="/backgrounds/bg-yunara.png" class="cosmic-bg" alt="">
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
                  <span class="nick-text">{{ brandName }}</span>
                </div>
                <div class="header-line right"></div>
              </div>
            </div>
            <div class="stats-grid-wrapper">
              <div class="stats-grid">
                <div class="glass-card">
                  <lucide-icon [img]="Skull" class="card-icon"></lucide-icon>
                  <div class="card-label-acc">Total acc</div>
                  <div class="card-value">{{ data.accountDeaths | number }}</div>
                  <div class="card-totals">Total: {{ data.totalDeaths | number }} · <span class="card-today">Hoy: {{ data.todayDeaths | number }}</span></div>
                  <!-- Streak/Winrate Carousel (horizontal slide) -->
                  <div class="streak-carousel" *ngIf="deltas.showStreak && showWinrateCarousel">
                    <div class="carousel-track">
                      <div class="carousel-slide">
                        <span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span>
                        <lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="7" class="streak-icon streak-win"></lucide-icon>
                        <lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="7" class="streak-icon streak-loss"></lucide-icon>
                      </div>
                      <div class="carousel-slide">
                        <span class="winrate-text">{{ winrateText }}</span>
                        <lucide-icon *ngIf="isWinrateHigh" [img]="Crown" [size]="7" class="winrate-icon winrate-high"></lucide-icon>
                        <lucide-icon *ngIf="!isWinrateHigh" [img]="HeartCrack" [size]="7" class="winrate-icon winrate-low"></lucide-icon>
                      </div>
                    </div>
                  </div>
                  <!-- Fallback: static streak -->
                  <div class="card-streak" *ngIf="deltas.showStreak && !showWinrateCarousel">
                    <span [class.streak-win-text]="deltas.streakType === 'W'" [class.streak-loss-text]="deltas.streakType === 'L'">{{ deltas.streakText }}</span>
                    <lucide-icon *ngIf="deltas.streakType === 'W'" [img]="TrendingUp" [size]="7" class="streak-icon streak-win"></lucide-icon>
                    <lucide-icon *ngIf="deltas.streakType === 'L'" [img]="TrendingDown" [size]="7" class="streak-icon streak-loss"></lucide-icon>
                  </div>
                </div>
                <div class="glass-card primary">
                  <lucide-icon [img]="Dumbbell" class="card-icon primary-icon"></lucide-icon>
                  <div class="card-label-acc">Total acc</div>
                  <div class="card-value primary-value">{{ data.accountAbs | number }}</div>
                  <div class="card-totals">Total: {{ data.totalAbs | number }} · <span class="card-today">Hoy: {{ data.todayAbs | number }}</span></div>
                  <div class="corner-accent"></div>
                  <!-- ABS Toast -->
                  <div class="abs-toast" *ngIf="showAbsToast">+{{ absToastAmount }} ABS</div>
                </div>
                <div class="glass-card">
                  <lucide-icon [img]="Calendar" class="card-icon"></lucide-icon>
                  <div class="card-value">{{ data.dayNumber }}</div>
                  <div class="card-label">DÍA</div>
                </div>
                <div class="glass-card">
                  <lucide-icon [img]="Trophy" class="card-icon"></lucide-icon>
                  <div class="card-value card-value-sm">{{ data.rank.tier }} {{ data.rank.division }}</div>
                  <div class="card-label">
                    {{ data.rank.lp }} LP
                    <span class="lp-trend" *ngIf="deltas.showLpTrend" [class.up]="deltas.lpDelta > 0" [class.down]="deltas.lpDelta < 0">{{ deltas.lpTrendText }}</span>
                  </div>
                  <!-- Rank Change Badge -->
                  <div class="rank-badge" *ngIf="showRankBadge" [class.up]="deltas.rankChangeDirection === 'up'" [class.down]="deltas.rankChangeDirection === 'down'">
                    {{ deltas.rankChangeText }}
                  </div>
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
    .outer-container { position: relative; width: fit-content; }
    .glow-ring { position: absolute; inset: -4px; background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3)); border-radius: 1.5rem; filter: blur(12px); animation: glowPulse 4s ease-in-out infinite; }
    @keyframes glowPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
    .main-container { position: relative; background-color: rgba(9, 9, 11, 0.3); backdrop-filter: blur(12px); border-radius: 1.5rem; border: 1px solid rgba(236, 72, 153, 0.25); overflow: hidden; min-width: 340px; }
    .header { position: relative; padding: 1.125rem 1.5rem; background: linear-gradient(to right, rgba(236, 72, 153, 0.08), rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.08)); }
    .header-content { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .header-line { height: 1px; flex: 1; }
    .header-line.left { background: linear-gradient(to right, transparent, rgba(236, 72, 153, 0.5)); }
    .header-line.right { background: linear-gradient(to left, transparent, rgba(236, 72, 153, 0.5)); }
    .header-text-container { display: flex; flex-direction: column; align-items: center; gap: 0.125rem; }
    .challenge-text { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.2em; color: #f9a8d4; text-transform: uppercase; white-space: nowrap; }
    .nick-text { font-size: 0.875rem; font-weight: 800; letter-spacing: 0.1em; color: white; text-transform: uppercase; white-space: nowrap; }
    .stats-grid-wrapper { padding: 1rem 1.25rem 1.5rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .glass-card { position: relative; padding: 0.875rem 1rem; border-radius: 0.875rem; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); }
    .glass-card:hover { border-color: rgba(236, 72, 153, 0.3); }
    .glass-card.primary { background: linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(168, 85, 247, 0.18) 100%); border: 1.5px solid rgba(236, 72, 153, 0.5); box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15); }
    .card-icon { width: 1.125rem; height: 1.125rem; color: #71717a; margin-bottom: 0.5rem; display: block; }
    .primary-icon { color: #f472b6; filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.6)); }
    .card-value { font-size: 1.875rem; font-weight: 700; line-height: 1; margin-bottom: 0.25rem; color: white; }
    .card-value-sm { font-size: 1.375rem; }
    .primary-value { color: #fce7f3; text-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }
    .card-label { font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 500; display: flex; align-items: center; gap: 0.25rem; }
    .card-label-acc { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.03em; color: #a1a1aa; margin-bottom: 2px; }
    .card-totals { display: flex; gap: 0.35rem; font-size: 0.55rem; color: #e4e4e7; font-weight: 500; letter-spacing: 0.02em; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .card-today { color: #f0abfc; font-weight: 600; }
    
    /* Streak with icon on right */
    .card-streak { display: flex; align-items: center; gap: 3px; margin-top: 3px; }
    .streak-icon { width: 8px !important; height: 8px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; vertical-align: middle; }\n    .streak-icon svg { width: 8px !important; height: 8px !important; display: block; }
    .streak-win { color: #22c55e; }
    .streak-loss { color: #ef4444; }
    .streak-win-text { font-size: 0.5rem; font-weight: 600; color: #22c55e; }
    .streak-loss-text { font-size: 0.5rem; font-weight: 600; color: #ef4444; }
    
    /* Streak/Winrate Carousel */
    .streak-carousel { overflow: hidden; width: 100%; height: 0.7rem; position: relative; margin-top: 3px; }
    .carousel-track { display: flex; flex-direction: row; width: 200%; animation: streakCarousel 12.6s ease-in-out infinite; }
    .carousel-slide { display: flex; align-items: center; gap: 3px; width: 50%; flex-shrink: 0; }
    .winrate-text { font-size: 0.5rem; font-weight: 600; color: #f0abfc; }
    .winrate-icon { width: 7px !important; height: 7px !important; flex-shrink: 0; display: inline-flex !important; align-items: center; }
    .winrate-icon svg { width: 7px !important; height: 7px !important; display: block; }
    .winrate-high { color: #fbbf24; }
    .winrate-low { color: #f87171; }
    @keyframes streakCarousel {
      0%, 63.5% { transform: translateX(0); }
      66% { transform: translateX(-50%); }
      97.6% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    
    .corner-accent { position: absolute; top: 6px; right: 6px; width: 10px; height: 10px; border-top: 1px solid rgba(236, 72, 153, 0.6); border-right: 1px solid rgba(236, 72, 153, 0.6); border-top-right-radius: 3px; }
    .bottom-accent { height: 4px; background: linear-gradient(to right, transparent, rgba(236, 72, 153, 0.5), transparent); }
    .corner-svg { position: absolute; width: 1rem; height: 1rem; color: rgba(236, 72, 153, 0.6); animation: cornerBreath 4s ease-in-out infinite; }
    @keyframes cornerBreath { 0%, 100% { color: rgba(236, 72, 153, 0.4); } 50% { color: rgba(236, 72, 153, 0.9); } }
    .corner-svg.top-left { top: -8px; left: -8px; }
    .corner-svg.top-right { top: -8px; right: -8px; }
    .corner-svg.bottom-left { bottom: -8px; left: -8px; }
    .corner-svg.bottom-right { bottom: -8px; right: -8px; }

    /* LP Trend */
    .lp-trend { font-size: 8px; font-weight: 600; }
    .lp-trend.up { color: #4ade80; }
    .lp-trend.down { color: #f87171; }

    /* Rank Badge */
    .rank-badge {
      position: absolute; top: 6px; left: 6px;
      font-size: 7px; font-weight: 700; padding: 2px 4px;
      border-radius: 3px; animation: rankBadgePulse 0.5s ease-out; white-space: nowrap;
    }
    .rank-badge.up { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.5); }
    .rank-badge.down { background: rgba(248, 113, 113, 0.2); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.5); }
    @keyframes rankBadgePulse { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    /* ABS Toast */
    .abs-toast {
      position: absolute; top: 6px; right: 24px;
      font-size: 9px; font-weight: 700; color: #f472b6;
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.4);
      padding: 2px 5px; border-radius: 4px;
      animation: absToastAnim 1s ease-out forwards;
      white-space: nowrap; z-index: 10; pointer-events: none;
    }
    @keyframes absToastAnim {
      0% { opacity: 0; transform: translateY(8px) scale(0.8); }
      15% { opacity: 1; transform: translateY(0) scale(1); }
      85% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-8px) scale(0.9); }
    }
  `]
})
export class OverlayStyle3Component implements OnInit, OnDestroy {
  @Input() account: string = 'account1';
  @Input() brandName: string = 'YUNARA LITERAL #abs';

  snapshot$!: Observable<Snapshot>;
  Skull = Skull; Dumbbell = Dumbbell; Calendar = Calendar; Trophy = Trophy;
  TrendingUp = TrendingUp; TrendingDown = TrendingDown;
  Crown = Crown; HeartCrack = HeartCrack;

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

  private toastTimeout?: any;
  private rankBadgeTimeout?: any;

  constructor(
    private trackerService: TrackerService,
    private overlayStateService: OverlayStateService
  ) { }

  ngOnInit() {
    const overlayId = `yunara-3-${this.account}`;

    this.snapshot$ = this.trackerService.getSnapshot(this.account).pipe(
      tap(snapshot => {
        this.deltas = this.overlayStateService.processSnapshot(overlayId, snapshot);

        if (this.deltas.shouldShowAbsToast) {
          this.showAbsToast = true;
          this.absToastAmount = this.deltas.absToastAmount;
          if (this.toastTimeout) clearTimeout(this.toastTimeout);
          this.toastTimeout = setTimeout(() => { this.showAbsToast = false; }, 1000);
        }

        if (this.deltas.showRankChange) {
          this.showRankBadge = true;
          if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout);
          this.rankBadgeTimeout = setTimeout(() => { this.showRankBadge = false; }, 10000);
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
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.rankBadgeTimeout) clearTimeout(this.rankBadgeTimeout);
  }

  private calculateWinrate(wins: number, losses: number): { text: string; showCarousel: boolean; winrateValue: number } {
    const totalGames = wins + losses;
    if (totalGames < 3) return { text: '', showCarousel: false, winrateValue: 0 };
    const wr = Math.round((wins / totalGames) * 100);
    return { text: `${wr}% WR`, showCarousel: true, winrateValue: wr };
  }
}
