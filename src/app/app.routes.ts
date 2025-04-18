import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./modules/web/web.routes')
    },
    {
        canActivate: [AuthGuard],
        canMatch: [AuthGuard], // Este guard es importante en lazy loading
        data: { roles: ['administrador'] },
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.routes')
    },
    {
        path: 'auth',
        loadChildren: () => import('./modules/auth/auth.routes')
    }
];
