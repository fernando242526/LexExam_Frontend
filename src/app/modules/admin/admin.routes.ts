import { Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";

export const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'especialidades',
                loadComponent: () => import('./especialidades/view-especialidades/view-especialidades.component'),
            },
            {
                path: 'especialidades/create',
                loadComponent: () => import('./components/especialidades-form/especialidades-form.component'),
            },
            {
                path: 'especialidades/edit/:id',
                loadComponent: () => import('./components/especialidades-form/especialidades-form.component'),
            },
            {
                path: 'balotarios',
                loadComponent: () => import('./balotarios/view-balotarios/view-balotarios.component'),
            },
            {
                path: 'balotarios/create',
                loadComponent: () => import('./components/balotarios-form/balotarios-form.component'),
            },
            {
                path: 'balotarios/edit/:id',
                loadComponent: () => import('./components/balotarios-form/balotarios-form.component'),
            },
        ]
    }
]

export default routes