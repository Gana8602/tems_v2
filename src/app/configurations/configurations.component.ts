import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Circle as CircleStyle, Fill, Stroke } from 'ol/style';

import Feature from 'ol/Feature';
import { Point, Circle } from 'ol/geom';
import { number } from 'echarts';
import { parseNumber } from 'devextreme/localization';
import { UnitsComponent } from "../units/units.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [FormsModule, UnitsComponent, CommonModule],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.css'
})
export class ConfigurationsComponent implements OnInit {
  Lat!: number ;
  Lang!: number;
  Warning: number = 32;
  Danger:number = 18;
  tide:number = 2.3;
  battery:number = 12.3;
  tideOffset:number = 2.3;
  belowwarning: number = 5.5;
  abovewarning:number = 12.4;
  belowdanger:number = 4.2;
  abovedanger:number = 2.5;
  currentUnit:String = 'm/s';
  selectedStationType: string = '';  // Bind this to the dropdown
  stationTypes: string[] = [];
  selectedUnit: string = 'mtr';

  slectedOption: String = 'tide';
  selectedcurrentUnit: string = 'm/s'; // Default selected unit
  onsubmit() {
    // Convert the updated coordinates to map projection
    this.center = fromLonLat([this.Lang, this.Lat]);
  
    // Update the map view to center on the new coordinates
    this.map.getView().setCenter(this.center);
  
    // Update the marker's geometry to the new position
    const marker = this.map.getLayers().getArray().find(layer => {
      return layer instanceof VectorLayer;
    }) as VectorLayer;
  
    if (marker) {
      const source = marker.getSource() as VectorSource;
      const features = source.getFeatures();
      
      // Assuming the marker is the first feature, update its position
      const markerFeature = features[0]; // First feature is the marker
      markerFeature.setGeometry(new Point(this.center)); // Update the geometry
  
      // Refresh the source to ensure the map re-renders
      source.refresh();
    }
  }
  selecteoption(typee: String) {
  this.slectedOption = typee;
  console.log(`selectedType : ${this.slectedOption}`);
  }

  selectUnit(unit: string) {
    this.selectedUnit = unit;
    console.log(`Selected unit: ${this.selectedUnit}`);
  }
  selectcurrentUnit(unit: string) {
    this.selectedcurrentUnit = unit;
    console.log(`Selected unit: ${this.selectedcurrentUnit}`);
  }

constructor (private staion:LayoutComponent){}
map!: Map;
center = fromLonLat([ 80.19146988481407,14.602590765602967]);
  ngOnInit(): void {
    // this.center = fromLonLat([this.Lang, this.Lat]);
  // Check if running in the browser
      const markerStyle = new Style({
        image: new Icon({
          src: '../../assets/buoy.png',
        scale: 0.04,
        }),
      });

      const marker = new Feature({
        geometry: new Point(this.center), // Start at center
      });
      marker.setStyle(markerStyle);

      // Create a circle geometry around the marker
      const circleFeature = new Feature({
        geometry: new Circle(this.center, this.Warning), // 180 meters radius
      });
      const circleFeature2 = new Feature({
        geometry: new Circle(this.center, this.Danger), // 180 meters radius
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
          zoom: 17, // Adjust zoom level as needed
        }),
        layers: [
          new TileLayer({
            source: new XYZ(
            {url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4',}
            ),
          }),
          vectorLayer,
        ],
        target: 'ol-map',
      });
      for (let index = 0; index < this.staion.sensorDataList.length; index++) {
        const element = this.staion.sensorDataList[index].StationID;
        this.stationTypes.push(element);
        
      }
  }

  clickon(typr:String){
    console.log(typr);
  }
}
