import { Route } from "@angular/router";
import { Navbar } from "../layout/navbar/navbar";
import { authGuard } from "../Auth/auth.guard";

export const CategoryRoutes: Route[] = [
    {
        path: '',
        component: Navbar,
        canActivate: [authGuard],
        children: [
            {
                path: "category-list",
                loadComponent: () =>
                    import("./category-list/category-list").then((m) => m.CategoryList),
            },
            {
                path: "category-create",
                loadComponent: () =>
                    import("./category-create/category-create").then((m) => m.CategoryCreate),
            },
            {
                path: "category-edit/:id",
                loadComponent: () =>
                    import("./category-create/category-create").then((m) => m.CategoryCreate),
            },
        ]
    }
];