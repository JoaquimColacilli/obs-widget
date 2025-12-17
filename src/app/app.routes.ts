import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OverlayComponent } from './components/overlay/overlay.component'; // Style 1
import { OverlayStyle2Component } from './components/overlay-style-2/overlay-style-2.component';
import { OverlayStyle3Component } from './components/overlay-style-3/overlay-style-3.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    // Specific Style Routes
    { path: 'overlay/style-1', component: OverlayComponent },
    { path: 'overlay/style-2', component: OverlayStyle2Component },
    { path: 'overlay/style-3', component: OverlayStyle3Component },

    // Legacy/Default Fallback
    { path: 'overlay', component: OverlayComponent },
];
