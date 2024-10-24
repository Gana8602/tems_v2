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
  Lang: number = 80.19146988481407;
  Lat: number = 14.602590765602967;
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
selectedcoordinate:string = 'DD';
  slectedOption: String = 'tide';
  selectedcurrentUnit: string = 'm/s'; // Default selected unit
  
  latdeg!:number;
  latmin!:number;
  latsec!:number;
  langdeg!:number;
  langmin!:number;
  langsec!:number;


  // Inside your ConfigurationsComponent class
  warningCircleStyle = new Style({
      stroke: new Stroke({
          color: 'red',
          width: 2,
      }),
      fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)', // Light red with transparency
      }),
  });
  
  dangerCircleStyle = new Style({
      stroke: new Stroke({
          color: 'yellow',
          width: 2,
      }),
      fill: new Fill({
          color: 'rgba(255, 255, 0, 0.2)', // Light yellow with transparency
      }),
  });
  

  onsubmit() {
    // Convert the updated coordinates to map projection
    this.center = fromLonLat([this.Lang, this.Lat]);
    console.log('Lat:', this.Lat, 'Lang:', this.Lang);
    console.log('Center:', this.center);
  
    // Update the map view to center on the new coordinates
    this.map.getView().setCenter(this.center);
  
    const markerLayer = this.map.getLayers().getArray().find(layer => layer instanceof VectorLayer) as VectorLayer;
  
    if (markerLayer) {
      const source = markerLayer.getSource() as VectorSource;
  
      // Clear all features from the source
      source.clear();
  
      // Create the marker feature at the new coordinates
      const markerFeature = new Feature({
        geometry: new Point(this.center),
      });
  
      const markerStyle = new Style({
        image: new Icon({
          src: '../../assets/buoy.png',
          scale: 0.04,
        }),
      });
      markerFeature.setStyle(markerStyle);
      source.addFeature(markerFeature);
  
      // Create new warning and danger circle features
      const warningCircleFeature = new Feature({
        geometry: new Circle(this.center, this.Warning),
      });
      const dangerCircleFeature = new Feature({
        geometry: new Circle(this.center, this.Danger),
      });
  
      // Style the circles
      warningCircleFeature.setStyle(this.warningCircleStyle);
      dangerCircleFeature.setStyle(this.dangerCircleStyle);
  
      // Add the updated circles back to the source
      source.addFeature(warningCircleFeature);
      source.addFeature(dangerCircleFeature);
  
      console.log('Updated Features:', source.getFeatures());
  
      // Refresh the source to ensure the map re-renders
      source.refresh();
    }
  
    // Force the map to update its size
    this.map.updateSize();
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
  selectcoordinate(unit: string) {
    this.selectedcoordinate = unit;
    console.log(`Selected unit: ${this.selectedcoordinate}`);
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
      // for (let index = 0; index < this.staion.sensorDataList.length; index++) {
        const element = this.staion.sensorDataList[0].StationID;
        this.stationTypes.push(element);
        
      // }
  }

  clickon(typr:String){
    console.log(typr);
  }
}
