import { RouterModule, Routes } from '@angular/router';
// import path from 'node:path';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgCircleProgressModule } from 'ng-circle-progress';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'main'
    },{
        path: 'main',
        component: LayoutComponent,
        children: [
            
            // {
            //     path: 'home',
            //     component: HomeComponent
            // }
            // ,
            // {
            //     path: 'dashboard',
            //     component: DashboardComponent
            // },
            // {
            //     path: 'report',
            //     component: ReportsComponent
            // },
            // {
            //     path:'analytics',
            //     component:AnalyticsComponent
            // }
        ]
    },


];
