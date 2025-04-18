import { Routes } from "@angular/router";
import { WebComponent } from "./web.component";

export const routes: Routes = [
    {
        path: '',
        component: WebComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./index/index.component'), 
            }
        ]
    }
]

export default routes