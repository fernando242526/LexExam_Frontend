import { Routes } from "@angular/router";
import { UserComponent } from "./user.component";

export const routes: Routes = [
    {
        path: '',
        component: UserComponent,
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./components/dashboard/dashboard.component'),
            },
            {
                path: 'examenes',
                loadComponent: () => import('./examenes/view-examenes/view-examenes.component'),
            },
            {
                path: 'examenes/iniciar/:id',
                loadComponent: () => import('./examenes/empezar-examen/empezar-examen.component'),
            },
            {
                path: 'examenes/resultado/:id',
                loadComponent: () => import('./examenes/examen-resultado/examen-resultado.component'),
            },
        ]
    }
]

export default routes