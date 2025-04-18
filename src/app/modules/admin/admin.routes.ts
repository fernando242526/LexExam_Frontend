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
            {
                path: 'temas',
                loadComponent: () => import('./temas/view-temas/view-temas.component'),
            },
            {
                path: 'temas/create',
                loadComponent: () => import('./components/temas-form/temas-form.component'),
            },
            {
                path: 'temas/edit/:id',
                loadComponent: () => import('./components/temas-form/temas-form.component'),
            },
            {
                path: 'preguntas',
                loadComponent: () => import('./preguntas/view-preguntas/view-preguntas.component'),
            },
            {
                path: 'preguntas/create-masivo',
                loadComponent: () => import('./components/preguntas-form/preguntas-form.component'),
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./usuarios/view-usuarios/view-usuarios.component'),
            },
            {
                path: 'usuarios/create',
                loadComponent: () => import('./components/usuarios-form/usuarios-form.component'),
            },
            {
                path: 'usuarios/edit/:id',
                loadComponent: () => import('./components/usuarios-form/usuarios-form.component'),
            },
            {
                path: 'usuarios/view/:id',
                loadComponent: () => import('./usuarios/usuario-detail/usuario-detail.component'),
            },
        ]
    }
]

export default routes