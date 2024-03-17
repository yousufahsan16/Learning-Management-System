import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { AuthGuard } from './shared/services/auth.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
      }]
  },
  {
    path: '',
    component: LoginSignupComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../app/login-signup/login-signup-routing.module').then(x => x.LoginSignupRoutes)
      }]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
]
