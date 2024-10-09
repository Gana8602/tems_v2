import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { NgCircleProgressModule } from "ng-circle-progress";
import { GoogleChartsModule } from 'angular-google-charts';
import { CommonModule } from "@angular/common";
import { DxCircularGaugeModule } from "devextreme-angular";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { GaugeComponent } from "./gauge/gauge.component";
// import { SpeedometerComponent } from './home/knot/knot.component';


@NgModule({
    declarations: [
   
    //   AppComponent,
    //   LayoutComponent,
    //   HomeComponent,
    //   DashboardComponent,
    //   ReportsComponent,
    //   AnalyticsComponent,
    //   SidenavComponent
 
    
    ],
    imports: [
        CommonModule,
      BrowserModule,
      DxCircularGaugeModule,
      HttpClientModule,
      FormsModule,
      
      GoogleChartsModule.forRoot(),
      
      RouterModule.forRoot(routes),  // <-- Make sure RouterModule is imported here
      NgCircleProgressModule.forRoot({
        radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
      animation: true,
      }),
     
    ],
    providers: [],
    // bootstrap: [AppComponent]
  })
  export class AppModule { }