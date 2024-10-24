import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import Map from 'ol/Map';
import View from 'ol/View';
import { Circle as CircleStyle, Fill, Text, Stroke, Style, Icon } from 'ol/style';
import { Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point, Circle, LineString } from 'ol/geom';
import { LayoutComponent } from '../layout/layout.component';
import { getDistance, offset } from 'ol/sphere';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  popupVisible = false;
  popupContent = '';
  popupPosition: [number, number] = [0, 0];
  map!: Map;
  center:[number, number] = fromLonLat([80.197876, 14.589438]) as [number, number];
  buoy2:[number, number] = fromLonLat([80.178118, 14.607975]) as [number, number];
  radius = 180;
  wrange = 80;
  vectorLayer!: VectorLayer;
  currentLayer!: TileLayer;
  
  mapUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
mapChange(name:String){
  console.log('taped');
  switch (name) {
    case 'OpenCycleMap':
      this.mapUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
      console.log("ok");
      break;
      case 'Transport':
        this.mapUrl = 'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
        break;
        case 'Landscape':
          this.mapUrl = 'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
          break;
          case 'Outdoors':
            this.mapUrl = 'https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
            break;
            case 'TransportDark':
              this.mapUrl = 'https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
              break;
              case 'Spinal Map':
                this.mapUrl = 'https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
                break;
      
    default:
      this.mapUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
      break;
  }
this.updateMapLayer();
}
updateMapLayer() {
  const tileLayer = this.map.getLayers().getArray().find(layer => layer instanceof TileLayer) as TileLayer;
  if (tileLayer) {
    const newSource = new XYZ({
      url: this.mapUrl,
    });
    tileLayer.setSource(newSource);
  }
}


  constructor(private layout: LayoutComponent) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const vectorSource = new VectorSource();
      
      this.vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      this.createMarker(this.center, 'Buoy 1', vectorSource);
      this.createMarker(this.buoy2, 'Buoy 2', vectorSource);
      this.createCircle(this.center, this.radius, 'red', vectorSource);
      this.createCircle(this.buoy2, this.radius, 'red', vectorSource);
      this.createCircle(this.center, this.wrange, 'yellow', vectorSource);
      this.createCircle(this.buoy2, this.wrange, 'yellow', vectorSource);
      const traveledPath: [number, number][] = [
        this.center,
        fromLonLat([80.198665, 14.591018]) as [number , number],
        fromLonLat([80.196796, 14.591477]) as [number , number], 
        fromLonLat([80.195717, 14.590024]) as [number, number],
        fromLonLat([80.195927, 14.587961]) as [number, number],
        fromLonLat([80.198033, 14.587043]) as [number, number],
        fromLonLat([80.199560, 14.589617]) as [number, number],
      ];
      const traveledPath2: [number, number][] = [
        this.buoy2,
        fromLonLat([80.185170, 14.619721]) as [number , number],
        fromLonLat([80.182909, 14.617035]) as [number , number], 
        fromLonLat([80.191029, 14.616439]) as [number, number],
        fromLonLat([80.194832, 14.621610]) as [number, number],
      ];
      this.createPathLine(traveledPath, vectorSource);
      this.createPathLine(traveledPath2, vectorSource);
      this.map = new Map({
        view: new View({
          center: this.center,
          zoom: 15,
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              url:this.mapUrl,
            }),
          }),
          this.vectorLayer,
        ],
        target: 'ol-map',
      });

      this.map.on('click', (event) => {
        this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
          if (feature instanceof Feature) {
            const name = feature.get('name');
            if (name) {
              console.log('Clicked marker: ' + name);
              this.layout.selectedBuoy = name;
              this.layout.sensors();
              this.layout.page = 'Dashboard';
            }
          }
        });
      });
    }
    
  }

  createPathLine(coords: [number, number][], vectorSource: VectorSource) {
    const lineString = new Feature({
      geometry: new LineString(coords),
    });
  
    const lineStyle = new Style({
      
      stroke: new Stroke({
        color: 'blue',
        width: 1,
      }),
    });
  
    lineString.setStyle(lineStyle);
    vectorSource.addFeature(lineString);
    this.addArrowsAlongLine(coords, vectorSource);
  }
  addArrowsAlongLine(coords: [number, number][], vectorSource: VectorSource) {
    const arrowIcon = new Style({
      image: new Icon({
        src: '../../assets/arrow-point-to-right (1).png', // Path to your arrow icon image
        scale: 0.5,
        color: '#0000', // Adjust the scale as necessary
        rotation: 90, // You can calculate rotation based on the line's direction
      }),
    });
  
    const arrowSpacing = 20; // Distance between arrows in meters
    const line = new LineString(coords);
    const length = line.getLength(); // Get the total length of the line
  
    for (let i = 0; i < length; i += arrowSpacing) {
      const point = line.getCoordinateAt(i / length); // Get coordinates at the current position
  
      const arrowFeature = new Feature({
        geometry: new Point(point),
      });
  
      arrowFeature.setStyle(arrowIcon);
      vectorSource.addFeature(arrowFeature);
    }
  }
  
  createMarker(coordinate: [number, number], name: string, vectorSource: VectorSource) {
    const markerStyle = new Style({
      image: new Icon({
        src: '../../assets/buoy.png',
        scale: 0.04,
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        text: name,
        offsetY: -50,
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        textAlign: 'center',
        textBaseline: 'middle',
      }),
    });

    const marker = new Feature({
      name,
      geometry: new Point(coordinate),
    });
    marker.setStyle(markerStyle);
    vectorSource.addFeature(marker);
  }

  createCircle(center: [number, number], radius: number, color: string, vectorSource: VectorSource) {
    const circleFeature = new Feature({
      geometry: new Circle(center, radius),
    });

    const circleStyle = new Style({
      stroke: new Stroke({ color, width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    });
    circleFeature.setStyle(circleStyle);
    vectorSource.addFeature(circleFeature);
  
    setTimeout(() => {
      const newCoords = this.center;
      const marker = vectorSource.getFeatures().find(f => f.get('name') === 'Buoy 1');
    
      if (marker) {
        marker.setGeometry(new Point(newCoords));
      }
    
      this.checkBuoyRange(newCoords);
      this.checkBuoyRange2(newCoords);
    }, 2000);
  }

  // Adding flags to prevent multiple identical logs
  lastBuoyRangeState ='';
  lastWarningState = '';
  
  checkBuoyRange(markerCoords: [number, number]): void {
    const distance = getDistance(this.center, markerCoords);
    const newState = distance > this.radius ? 'Buoy 1 missing or out of range' : 'Buoy 1 within range';
    if (newState !== this.lastBuoyRangeState) {
      console.log(newState);
      this.lastBuoyRangeState = newState;
    }
  }

  checkBuoyRange2(markerCoords: [number, number]): void {
    const distance = getDistance(this.center, markerCoords);
    const newWarningState = distance > this.wrange ? 'Buoy 2 far beyond range' : 'Buoy 2 within warning range';
    if (newWarningState !== this.lastWarningState) {
      console.log(newWarningState);
      this.lastWarningState = newWarningState;
    }
  }
}
