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
import { Point, Circle } from 'ol/geom';
import { LayoutComponent } from '../layout/layout.component';
import { offset } from 'ol/sphere';

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
  center:[number, number] = fromLonLat([80.19146988481407, 14.602590765602967]) as [number, number];
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
                this.mapUrl = 'https://tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
                break;
      
    default:
      this.mapUrl = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4';
      break;
  }
this.updateMapLayer();
}
updateMapLayer() {
  // Update the source of the current tile layer
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
              this.layout.page = 'Dashboard';
              // this.sidenav.selectedPage = 'Dashboard';
            }
          }
        });
      });
    }
  }

  createMarker(coordinate: [number, number], name: string, vectorSource: VectorSource) {
    const markerStyle = new Style({
      image: new Icon({
        src: '../../assets/buoy.png',
        scale: 0.04,
        // size:[50, 30]
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
  }

  
}
