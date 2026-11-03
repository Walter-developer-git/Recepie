import { Component, OnInit, AfterViewInit, inject, ViewChild } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { RecepieService } from "../../../recepie/recepie.service";
import { CategoryService } from "../../../category/category.service";
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ProfileService } from "../../profile.service";
import { UserService } from "../../../layout/navbar/user.service";
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { FormBuilder, FormGroup } from "@angular/forms";
import { CommonModule } from "@angular/common";

Chart.register(...registerables);

@Component({
  selector: 'app-admin-panel',
  imports: [
    CommonModule,
    MatTableModule, MatIconModule,
    MatPaginatorModule, MatTabsModule, ToastModule,
    ButtonModule, RippleModule,
        MatSelectModule,
    MatFormFieldModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss'
})
export class AdminPanel implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'text', 'actions'];
  displayedCategoryColumns: string[] = ['name', 'actions'];
  displayedUserColumns: string[] = ['name', 'last_name' , 'email', 'role'];
  dataSource = new MatTableDataSource<IRecipe>([]);
  dataSourceCategory = new MatTableDataSource<IRecipe>([]);
  dataSourceUsers = new MatTableDataSource<IRecipe>([]);
  recpieService = inject(RecepieService);
  categoryService = inject(CategoryService);
  profileService = inject(ProfileService);
  userService = inject(UserService);
  route = inject(Router);
  totalRecipie!: number;
  totalCategory!: number;
  totalUsers!: number;
  fb = inject(FormBuilder);
  form!: FormGroup;
  filterCharts = [{
    label: 'ماهانه', value: 'month'
  }, {
    label: 'هفتگی', value: 'week'
  }]
  matIndex: number = 0;
  private messageService = inject(MessageService)

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.getRecipieData();
    this.getCategory();
    this.getUsers();

    this.form = this.fb.group({
      title: [''],
      ingredient: [''],
      sortOrder: ['title_asc']
    });

    //     this.userService.isAdmin$.subscribe(isAdmin => {
    //   if (!isAdmin) {
    //     this.messageService.add({ severity: 'error', summary: 'خطا', detail: 'شما دسترسی ویرایش این صفحه را ندارید' });
    //     setTimeout(() => {

    //       this.route.navigateByUrl('category/category-list');
    //     }, 1500);
    //   }
    // });
  }

    showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'موفق',
      detail: 'عملیات با موفقیت انجام شد'
    });
  }

  ngAfterViewInit(): void {
    // const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    // const ctx1 = document.getElementById('lineChart1') as HTMLCanvasElement;
    // const ctx2 = document.getElementById('lineChart2') as HTMLCanvasElement;
    // const ctx3 = document.getElementById('lineChart3') as HTMLCanvasElement;

    // const config: ChartConfiguration = {
    //   type: 'line',
    //   data: {
    //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //     datasets: [
    //       {
    //         label: 'Date',
    //         data: [150, 200, 180, 220, 170, 250],
    //         borderColor: 'blue',
    //         backgroundColor: 'rgba(0, 123, 255, 0.3)',
    //         tension: 0.3, // curve smoothness
    //         fill: true
    //       }
    //     ]
    //   },
    //   options: {
    //     responsive: true,
    //     plugins: {
    //       legend: {
    //         display: true
    //       },
    //       tooltip: {
    //         enabled: true
    //       }
    //     },
    //     scales: {
    //       x: {
    //         title: { display: true, text: 'Month' }
    //       },
    //       y: {
    //         title: { display: true, text: 'Value' },
    //         beginAtZero: true
    //       }
    //     }
    //   }
    // };

    // new Chart(ctx, config);
    // new Chart(ctx1, config);
    // new Chart(ctx2, config);
    // new Chart(ctx3, config);
    
    this.getAnalytic('month', 'views', 'lineChart', 'blue', 'Views');
    this.getAnalytic('month', 'favorites', 'lineChart1', 'green', 'Favorites');
    this.getAnalytic('month', 'ratings', 'lineChart2', 'red', 'Ratings');
    this.getAnalytic('month', 'recipes', 'lineChart3', 'orange', 'Recipes');
  }

 deleteElement(item: IRecipe): void {
  this.recpieService.deleteRecipe(item.id).subscribe({
    next: (response) => {
      this.getRecipieData(this.paginator?.pageIndex || 0);
      this.messageService.add({
        severity: 'error',
        summary: 'اخطار',
        detail: 'دستور پخت حذف گردید',
      });
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.error?.error || 'خطایی رخ داده است',
      });
    },
  });
}

  deleteElementCategory(item: any): void {
  this.categoryService.deleteCategory(item.ID).subscribe({
    next: (response) => {
      this.getCategory();
      this.messageService.add({
        severity: 'error',
        summary: 'اخطار',
        detail: 'دستور پخت حذف گردید',
      });
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.error?.error || 'خطایی رخ داده است',
      });
    },
  });
}

  edit(item: IRecipe): void {
    this.route.navigate(['recepie/recepie-edit/' + item.id]);
  }

  editCategory(item: any): void {
    this.route.navigate(['category/category-edit/' + item.ID]);
  }

  getRecipieData(pageIndex = 0) {
    this.recpieService.getRecipeList(pageIndex, {}).subscribe((response: any) => {
      this.dataSource = new MatTableDataSource<IRecipe>(response.data);
      this.totalRecipie = response.count;
      // this.dataSource.paginator;
    });
  }

  loadCharts($event: any) {
    if($event == 'week') {
      this.getAnalytic('week', 'views', 'lineChart', 'blue', 'Views');
      this.getAnalytic('week', 'favorites', 'lineChart1', 'green', 'Favorites');
      this.getAnalytic('week', 'ratings', 'lineChart2', 'red', 'Ratings');
      this.getAnalytic('week', 'recipes', 'lineChart3', 'orange', 'Recipes');
    } else {
      this.getAnalytic('month', 'views', 'lineChart', 'blue', 'Views');
      this.getAnalytic('month', 'favorites', 'lineChart1', 'green', 'Favorites');
      this.getAnalytic('month', 'ratings', 'lineChart2', 'red', 'Ratings');
      this.getAnalytic('month', 'recipes', 'lineChart3', 'orange', 'Recipes');
    }
  }

getAnalytic(
  period: string,
  mode: string,
  chartId: string,
  color: string,
  datasetLabel: string
) {
  this.userService.getAnalytic(period, mode).subscribe((response: any) => {
    const labels = response.labels;
    const dataset = response.datasets[0].data;
    const chartLabel = response.datasets[0].label;
    const backgroundColor = response.datasets[0].backgroundColor;
    const borderColor = response.datasets[0].borderColor;

    this.createChart(chartId, labels, dataset, borderColor,
       chartLabel, backgroundColor, period);
  });
}

charts: { [key: string]: Chart } = {};


private createChart(
  elementId: string,
  labels: string[],
  values: number[],
  borderColor: string,
  datasetLabel: string,
  backgroundColor: string,
  period: string
) {
  const ctx = document.getElementById(elementId) as HTMLCanvasElement;
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (this.charts[elementId]) {
    this.charts[elementId].destroy();
  }

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: values,
          borderColor,
          tension: 0.3,
          fill: true,
          backgroundColor
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: { title: { display: true, text: period } },
        y: { title: { display: true, text: datasetLabel }, beginAtZero: true },
      },
    },
  };

  // Create chart and save reference
  this.charts[elementId] = new Chart(ctx, config);
}


  getCategory(pageIndex = 0) {
    this.categoryService.getCategoryList(pageIndex, {}).subscribe((response: any) => {
      this.dataSourceCategory = new MatTableDataSource<IRecipe>(response.data);
      this.totalCategory = response.count;
    });
  }

  getUsers(pageIndex = 0) {    
    this.profileService.getAllUsers(pageIndex, {}).subscribe((response: any) => {
      this.totalUsers = response.count;
      this.dataSourceUsers = new MatTableDataSource<IRecipe>(response.data);
    });
  }

  tabChanged($event: any) {
    this.matIndex = $event.index;
  }

  paginationRecpie(event: any) {
      this.getRecipieData(event.pageIndex)
  }

  paginationCategory(event: any) {
      this.getCategory(event.pageIndex)
  }

  paginationUsers(event: any) {
      this.getUsers(event.pageIndex)
  }
}

export interface IRecipe {
  ID: number;
  id: number;
  title: string;
  text: string;
  user_id: number;
  ingredients: any[];
  tags: string[]; // adjust if tags have objects instead of strings
  categories: string[]; // adjust if categories have objects instead of strings
  steps: any[];
  images: number[]; // image IDs
  favorite_count: number;
  is_favorited: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}