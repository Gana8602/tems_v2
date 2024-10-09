import { Component, forwardRef, Inject, Optional } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { Point, Circle } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import { HomechartComponent } from '../homechart/homechart.component';
import { KnotComponent } from '../home/knot/knot.component';
import { BatteryComponent } from '../battery/battery.component';
import { getDistance } from 'ol/sphere';
import { GaugeComponent } from "../gauge/gauge.component"; // Import distance calculation function

import { HttpClientModule } from '@angular/common/http';
import { SensorService } from '../sensor.service';
import { response } from 'express';
import { LayoutComponent } from '../layout/layout.component';
import { url } from 'node:inspector';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [HomechartComponent, HttpClientModule, KnotComponent, BatteryComponent, GaugeComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
constructor(private layout:LayoutComponent){}
  compassvalue1: number = 180;
  compassvalue2: number = 45;
  compassvalue3: number = 120;
  progressValue = 10; // Set your initial value
  currentSpeed: number = 100;
  currentValue: number = 20; // example value in Knots
  maxValue: number = 40; // assuming max value is 40 knots
  map!: Map;
  battery:number = 0;

   
  center = fromLonLat([ 80.19146988481407,14.602590765602967]); // Center coordinates
  radius = 180;
  wrange = 80; // Circle radius in meters

  // Correct calculation for the needle rotation, mapped between -135 and +135 degrees
  get needleRotation(): number {
    const minAngle = -135;
    const maxAngle = 135;
    return minAngle + (this.currentValue / this.maxValue) * (maxAngle - minAngle) - 90;
  }

  // Calculate the stroke offset for progress
  get strokeDashOffset(): number {
    const circleCircumference = 549.78; // the circle's total circumference
    return circleCircumference * (1 - this.currentValue / this.maxValue) + 70;
  }
 

  updateSpeed(newSpeed: number) {
    this.currentSpeed = newSpeed;
  }

  ngOnInit(): void {
    
//  const lat = parseFloat(this.layout.sensorDataList[0]?.LAT);
//  const long = parseFloat(this.layout.sensorDataList[0]?.LONG);
 
//  this.center = fromLonLat([long, lat]);
    if (typeof window !== 'undefined') { // Check if running in the browser
      const markerStyle = new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.3,
        }),
      });

      const marker = new Feature({
        geometry: new Point(this.center), // Start at center
      });
      marker.setStyle(markerStyle);

      // Create a circle geometry around the marker
      const circleFeature = new Feature({
        geometry: new Circle(this.center, this.radius), // 180 meters radius
      });
      const circleFeature2 = new Feature({
        geometry: new Circle(this.center, this.wrange), // 180 meters radius
      });

      // Style the circle
      const circleStyle = new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)', // light blue with transparency
        }),
      });
      circleFeature.setStyle(circleStyle);
      const circleStyle2 = new Style({
        stroke: new Stroke({
          color: 'yellow',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)', // light blue with transparency
        }),
      });
      circleFeature2.setStyle(circleStyle2);

      const vectorSource = new VectorSource({
        features: [marker, circleFeature,circleFeature2], // Add both marker and circle
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      this.map = new Map({
        view: new View({
          center: this.center,
          zoom: 15, // Adjust zoom level as needed
        }),
        layers: [
          new TileLayer({
            source: new XYZ(
            {url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',}
            ),
          }),
          vectorLayer,
        ],
        target: 'ol-map',
      });

      // Simulate moving the marker to a new location
      setTimeout(() => {
        const newCoords = this.center; // Example new marker position
        marker.getGeometry()?.setCoordinates(newCoords);
        this.checkBuoyRange(newCoords as [number, number]);
        this.checkBuoyRange2(newCoords as [number, number]);
      }, 3000); // Simulate after 3 seconds 
    }
  }

  // Function to check if the marker is within the range
  checkBuoyRange(markerCoords: [number, number]): void {
    const distance = getDistance(this.center, markerCoords); // Calculate the distance in meters
    if (distance > this.radius) {
      console.log('Buoy missing or out of range');
    } else {
      console.log('Buoy within range');
    }
  }
  checkBuoyRange2(markerCoords: [number, number]): void {
    const distance = getDistance(this.center, markerCoords); // Calculate the distance in meters
    if (distance > this.wrange) {
      console.log('Buoy is warning range');
    } else {
      console.log('Buoy within range2');
    }
  }
}
