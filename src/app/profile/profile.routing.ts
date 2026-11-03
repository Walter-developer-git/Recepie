import { Route } from "@angular/router";
import { Navbar } from "../layout/navbar/navbar";
import { authGuard } from "../Auth/auth.guard";

export const ProfileRoutes: Route[] = [
    {
        path: '',
        component: Navbar,
        canActivate: [authGuard],
        children: [
            {
                path: "profile",
                loadComponent: () =>
                    import("./profile").then((m) => m.Profile),
            },
            {
                path: "admin-panel",
                loadComponent: () =>
                    import("./admin-profile/admin-panel/admin-panel").then((m) => m.AdminPanel),
            }
        ]
    }
];