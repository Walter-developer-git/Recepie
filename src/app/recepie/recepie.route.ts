import { Route } from "@angular/router";
import { Navbar } from "../layout/navbar/navbar";
import { authGuard } from "../Auth/auth.guard";

export const RecepieRoutes: Route[] = [
  {
    path: '',  // Changed from 'recepie' to empty path
    component: Navbar,
    canActivate: [authGuard],
    children: [
      {
        path: 'recepie-list',
        loadComponent: () =>
          import("./recepie-list/recepiee-list").then((m) => m.RecepieeList),
      },
      {
        path: 'recepie-detail/:id',
        loadComponent: () =>
          import("./recepie-detail/recepie-detail").then((m) => m.RecepieDetail),
      },
      {
        path: 'recepie-create',
        loadComponent: () =>
          import("./recepie-create/recepie-create").then((m) => m.RecepieCreate),
      },
      {
        path: 'recepie-edit/:id',
        loadComponent: () =>
          import("./recepie-create/recepie-create").then((m) => m.RecepieCreate),
      },
      {
        path: 'ingredient',
        loadComponent: () =>
          import("./ingredient/ingredient").then((m) => m.IngredientFormComponent),
      },
      {
        path: '',  // Default redirect
        redirectTo: 'recepie-list',
        pathMatch: 'full'
      },
      {
        path: '**',  // Wildcard route
        redirectTo: 'recepie-list'
      }
    ]
  }
];