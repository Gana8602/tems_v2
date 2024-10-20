import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { BatteryComponent } from '../battery/battery.component';
import { HealthComponent } from '../health/health.component';
import { GaugeComponent } from '../gauge/gauge.component';

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
  compassvalue1: number = 180;
  compassvalue2: String = "045";
  compassvalue3: number = 120;
  progressValue = 10;
  currentSpeed: number = 100;
  currentValue: number = 20;
  maxValue: number = 40;

  battery: number = 0;


  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private layout: LayoutComponent
  ) {
    // Check if the code is running in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Initialize map only after view has been fully rendered
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadLeafletAndInitializeMap();
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
      iconSize: [24, 24], // Set the size of the marker
    });

    const marker = L.marker(this.center, { icon: markerIcon }).addTo(this.map);

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
      console.log('Buoy within range');
    }
  }

  checkBuoyRange2(markerCoords: [number, number], L: any): void {
    const distance = this.map.distance(this.center, markerCoords);
    if (distance > this.wrange) {
      console.log('Buoy is warning range');
    } else {
      console.log('Buoy within range2');
    }
  }
}
