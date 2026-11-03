import { Route } from "@angular/router";

export const AuthRoutes: Route[] = [
  {
    path: "login",
    loadComponent: () =>
      import("./login/login").then((m) => m.Login),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./register/register").then((m) => m.Register),
  },
];
