import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { BatteryComponent } from '../battery/battery.component';
import { HealthComponent } from '../health/health.component';
import { GaugeComponent } from '../gauge/gauge.component';
import { number } from 'echarts';
import { fromLonLat } from 'ol/proj';
import { text } from 'node:stream/consumers';


interface SensorData {
  id:number;
  StationID: string;
  Date: string;
  Time: string;
  UTC_Time:string;
  LAT: number;
  LONG: number;
  BatteryVoltage: string;
  GPS_Date: string;
  Lower_CurrentSpeedDirection:string;
  Middle_CurrentSpeedDirection:string;
  S1_RelativeWaterLevel:number;
  S2_SurfaceCurrentSpeedDirection:string;

};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports:[BatteryComponent, HealthComponent, GaugeComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  isBrowser: boolean;
  map!: any;  // Leaflet Map will be dynamically loaded only in the browser
  center: [number, number] = [14.602590765602967, 80.19146988481407];
  radius = 180;
  wrange = 80;
  compassvalue1: number = 170;
  compval1!:string;
  compassvalue2: number = 45;
  compval2!:string;
  compassvalue3: number = 163;
  compval3!:string;
  progressValue = 10;
  currentSpeed: number = 100;
  currentValue: number = 20;
  maxValue: number = 40;
  tide:number = 13;
  lat!:number;
  lang!:number;
  s_current:number =0;
  m_current:number =0;
  l_current:number = 0;
  s_current_d!:number;
  m_current_d!:number;
  l_current_d!:number;
  battery: number = 10.3;
  message:string = 'range';

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private layout: LayoutComponent,
    private cdr: ChangeDetectorRef
  ) {
    // Check if the code is running in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Initialize map only after view has been fully rendered
  ngAfterViewInit(): void {
    this.fetch();
    if (this.isBrowser) {
      this.loadLeafletAndInitializeMap();
    }
    
  }
  sensorDatelist:SensorData[]=[];

  fetch(){
    this.sensorDatelist=this.layout.sensorDataList;
    console.log('sensors:', this.sensorDatelist);
    this.tide= this.sensorDatelist[0].S1_RelativeWaterLevel;
  this.lat = this.sensorDatelist[0].LAT;
  this.lang = this.sensorDatelist[0].LONG;
  // this.center = [this.lat, this.lang];
  this.s_current =parseFloat(this.sensorDatelist[0].S2_SurfaceCurrentSpeedDirection.split(';')[0]); 
  this.m_current =parseFloat(this.sensorDatelist[0].Middle_CurrentSpeedDirection.split(';')[0]); 
  this.l_current =parseFloat(this.sensorDatelist[0].Lower_CurrentSpeedDirection.split(';')[0]); 
console.log('scurrent:', this.s_current, this.m_current, this.l_current);
   this.cdr.detectChanges();
this.compassvalue1 = parseFloat(this.sensorDatelist[0].S2_SurfaceCurrentSpeedDirection.split(';')[1]);
this.compval1= this.direction(this.compassvalue1);
this.compassvalue2 = parseFloat(this.sensorDatelist[0].Middle_CurrentSpeedDirection.split(';')[1]);
this.compval2= this.direction(this.compassvalue2);
// this.compassvalue3 = parseFloat(this.sensorDatelist[0].Lower_CurrentSpeedDirection.split(';')[1]);
this.compval3= this.direction(this.compassvalue3);
  }
  direction(degrees: number): string {
    // Normalize degrees to be between 0 and 360
    degrees = degrees % 360;
    if (degrees < 0) degrees += 360;
  
    // Determine the direction based on degree ranges
    if (degrees >= 348.75 || degrees < 11.25) {
      return 'N';   // North
    } else if (degrees >= 11.25 && degrees < 33.75) {
      return 'NNE'; // North-Northeast
    } else if (degrees >= 33.75 && degrees < 56.25) {
      return 'NE';  // Northeast
    } else if (degrees >= 56.25 && degrees < 78.75) {
      return 'ENE'; // East-Northeast
    } else if (degrees >= 78.75 && degrees < 101.25) {
      return 'E';   // East
    } else if (degrees >= 101.25 && degrees < 123.75) {
      return 'ESE'; // East-Southeast
    } else if (degrees >= 123.75 && degrees < 146.25) {
      return 'SE';  // Southeast
    } else if (degrees >= 146.25 && degrees < 168.75) {
      return 'SSE'; // South-Southeast
    } else if (degrees >= 168.75 && degrees < 191.25) {
      return 'S';   // South
    } else if (degrees >= 191.25 && degrees < 213.75) {
      return 'SSW'; // South-Southwest
    } else if (degrees >= 213.75 && degrees < 236.25) {
      return 'SW';  // Southwest
    } else if (degrees >= 236.25 && degrees < 258.75) {
      return 'WSW'; // West-Southwest
    } else if (degrees >= 258.75 && degrees < 281.25) {
      return 'W';   // West
    } else if (degrees >= 281.25 && degrees < 303.75) {
      return 'WNW'; // West-Northwest
    } else if (degrees >= 303.75 && degrees < 326.25) {
      return 'NW';  // Northwest
    } else {
      return 'NNW'; // North-Northwest
    }
  }
  async loadLeafletAndInitializeMap(): Promise<void> {
    const L = await import('leaflet');  // Lazy-load Leaflet
    this.initializeLeafletMap(L);
  }

  initializeLeafletMap(L: any): void {
    const mapContainer = document.getElementById('leaflet-map');
    
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    this.map = L.map('leaflet-map').setView(this.center, 15);

    L.tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4', {
      maxZoom: 18
    }).addTo(this.map);

    const markerIcon = L.icon({
      iconUrl: '../../assets/buoy.png',
      name:'Buoy 1',
      
      iconSize: [24, 24], // Set the size of the marker
    });

    const marker = L.marker(this.center, { icon: markerIcon }).bindTooltip(this.layout.selectedBuoy, {
      permanent: true,
      offset: [0, 20],
       // To make the tooltip always visible
      direction: 'bottom', // Tooltip position relative to marker
    }).addTo(this.map);

    const circle = L.circle(this.center, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.1,
      radius: this.radius
    }).addTo(this.map);

    const warningCircle = L.circle(this.center, {
      color: 'yellow',
      fillColor: '#ff0',
      fillOpacity: 0.1,
      radius: this.wrange
    }).addTo(this.map);

    setTimeout(() => {
      const newCoords = this.center; // Simulate new position
      marker.setLatLng(newCoords);
      this.checkBuoyRange(newCoords, L);
      this.checkBuoyRange2(newCoords, L);
    }, 3000);
  }

  // Function to check if the marker is within the range
  checkBuoyRange(markerCoords: [number, number], L: any): void {
    const distance = this.map.distance(this.center, markerCoords);
    if (distance > this.radius) {
      console.log('Buoy missing or out of range');
    } else {
      this.message = 'range';
      console.log('Buoy within range');
    }
  }

  checkBuoyRange2(markerCoords: [number, number], L: any): void {
    const distance = this.map.distance(this.center, markerCoords);
    if (distance > this.wrange) {
      console.log('Buoy is crossed warning range');
      this.message = 'warning';
    } else if (distance > this.radius) {
      console.log('Buoy crossed danger range');
      this.message = 'warning';
    }else{
      this.message = 'range';
      console.log('Buoy within range2');
    }
  }
}
