import { Route } from "@angular/router";

export const appRoutes: Route[] = [   
  {
    path: "",
    children: [
      {
        path: "",
        redirectTo: "recepie/recepie-list",
        pathMatch: "full"
      },
      {
        path: "recepie",
        loadChildren: () =>
          import("./recepie/recepie.route").then((c) => c.RecepieRoutes),
      },
      {
        path: "category",
        loadChildren: () =>
          import("./category/category.routing").then((c) => c.CategoryRoutes),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import("./Auth/auth.routing").then((m) => m.AuthRoutes),
      },
      {
        path: '',
        loadChildren: () =>
          import("./profile/profile.routing").then((m) => m.ProfileRoutes),
      },
    ]
  }
]