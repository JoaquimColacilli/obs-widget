import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { OverlayStyle2Component } from './components/overlay-style-2/overlay-style-2.component';
import { OverlayStyle3Component } from './components/overlay-style-3/overlay-style-3.component';
import { OverlayLamej0r1Component } from './components/overlay-lamej0r-1/overlay-lamej0r-1.component';
import { OverlayLamej0r2Component } from './components/overlay-lamej0r-2/overlay-lamej0r-2.component';
import { OverlayLamej0r3Component } from './components/overlay-lamej0r-3/overlay-lamej0r-3.component';
import { OverlayWaos1Component } from './components/overlay-waos-1/overlay-waos-1.component';
import { OverlayWaos2Component } from './components/overlay-waos-2/overlay-waos-2.component';
import { OverlayWaos3Component } from './components/overlay-waos-3/overlay-waos-3.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },

    // Yunara (account1) - Pink/Purple
    { path: 'overlay/style-1', component: OverlayComponent },
    { path: 'overlay/style-2', component: OverlayStyle2Component },
    { path: 'overlay/style-3', component: OverlayStyle3Component },

    // lamej0r (account2) - Dark Violet
    { path: 'overlay/lamej0r/style-1', component: OverlayLamej0r1Component },
    { path: 'overlay/lamej0r/style-2', component: OverlayLamej0r2Component },
    { path: 'overlay/lamej0r/style-3', component: OverlayLamej0r3Component },

    // waos (account3) - Aqua/Teal
    { path: 'overlay/waos/style-1', component: OverlayWaos1Component },
    { path: 'overlay/waos/style-2', component: OverlayWaos2Component },
    { path: 'overlay/waos/style-3', component: OverlayWaos3Component },

    // Legacy fallback
    { path: 'overlay', component: OverlayComponent },
];
