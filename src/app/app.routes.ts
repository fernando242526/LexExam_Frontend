import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./modules/web/web.routes')
    },
    {
        canActivate: [AuthGuard],
        canMatch: [AuthGuard],
        data: { roles: ['administrador'] },
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.routes')
    },
    {
        canActivate: [AuthGuard],
        canMatch: [AuthGuard],
        data: { roles: ['abogado'] },
        path: 'user',
        loadChildren: () => import('./modules/user/user.routes')
    },
    {
        path: 'auth',
        loadChildren: () => import('./modules/auth/auth.routes')
    }
];