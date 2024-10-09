import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import Map from 'ol/Map';
import View from 'ol/View';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point, Circle } from 'ol/geom';  // Use Circle from ol/geom

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  map!: Map;
  center = fromLonLat([14.629514,80.234540]); // Center coordinates

  ngOnInit(): void {
    if (typeof window !== 'undefined') { // Check if running in the browser
      const markerStyle = new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.3,
        }),
      });

      const marker = new Feature({
        geometry: new Point(this.center),
      });
      marker.setStyle(markerStyle);

      // Create a circle geometry around the marker
      const circleFeature = new Feature({
        geometry: new Circle(this.center, 180), // 18 meters radius
      });

      // Style the circle
      const circleStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)', // light blue with transparency
        }),
      });
      circleFeature.setStyle(circleStyle);

      const vectorSource = new VectorSource({
        features: [marker, circleFeature], // Add both marker and circle
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      this.map = new Map({
        view: new View({
          center: this.center,
          zoom: 10, // Adjust zoom level as needed
        }),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        target: 'ol-map',
      });
    }
  } 
}
