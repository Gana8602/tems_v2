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


@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.css'
})
export class ConfigurationsComponent implements OnInit {
  Lat: number = 13.2243;
  Lang: number = 15.32;
  Warning: number = 32;
  Danger:number = 18;
  tide:number = 2.3;
  battery:number = 12.3;
  selectedStationType: string = '';  // Bind this to the dropdown
  stationTypes: string[] = [];
constructor (private staion:LayoutComponent){}
map!: Map;
center = fromLonLat([ 80.19146988481407,14.602590765602967]);
  ngOnInit(): void {
    
  // Check if running in the browser
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
            {url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',}
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
