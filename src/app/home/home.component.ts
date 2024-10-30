import { Component, OnInit, Renderer2 } from '@angular/core';
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
import { SensorData, StationConfigs, SensorData2 } from '../../model/config.model';
import { ConfigDataService } from '../config-data.service';
import { HttpClientModule } from '@angular/common/http';
import { config } from 'process';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers:[ConfigDataService]
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
  bouy1wrange!:number;
  buoy2wrange!:number;
  buoy1danger!:number;
  buoy2danger!:number;
  vectorLayer!: VectorLayer;
  currentLayer!: TileLayer;
  showPaths = false;
  stationCOnfig: StationConfigs[]=[];
  sensorsliveData:SensorData[]=[];
  sensorsliveData2:SensorData2[]=[];
  stationName1!:string;
  stationName2!:string;
  livelocationbuoy1!:[number,  number];
  livelocationbuoy2!:[number,  number];
  selectedBuoy!:string;
  trackpath1:[number, number][]=[this.center];
  trackpath2:[number, number][]=[this.buoy2];
  
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

ngOnInit(): void {
  
  this.data.getSensorLiveData('2024-01-01', '2024-10-25').subscribe(sensors=>{
    this.sensorsliveData = sensors.buoy1;
    this.sensorsliveData2 = sensors.buoy2;
    console.log(this.sensorsliveData);
   

    console.log('sensorsd == ', this.sensorsliveData2);
    this.livelocationbuoy1 = fromLonLat([this.sensorsliveData[0].LONG, this.sensorsliveData[0].LAT]) as [number, number];
    this.livelocationbuoy2 = fromLonLat([this.sensorsliveData2[0].LAT, this.sensorsliveData2[0].LONG]) as [number, number];
    console.log("live location: ==",this.livelocationbuoy1);

    //2nd run
    this.data.getStationNames().subscribe(configs=>{
      this.bouy1wrange = configs[0].warning_circle;
      this.buoy2wrange = configs[1].warning_circle;
      this.buoy1danger = configs[0].danger_circle;
      this.buoy2danger = configs[1].danger_circle;
   const status =  this.coordassign(configs);
        if(status == true){
          console.log("sucess");
          if (!this.map) {
            this.MapInit();
          }
        }

    })
        });
    
    
    
}


coordassign(configs: StationConfigs[]): boolean {
  // Ensure there are at least two configurations in the array to avoid errors
  if (configs.length < 2) {
    console.error("Insufficient station configurations provided.");
    return false;
  }

  // Assign station names
  this.stationName1 = configs[0].station_name;
  this.stationName2 = configs[1].station_name;

  // Function to convert DMS to Decimal Degrees
  const convertDMSToDD = (deg: number, min: number, sec: number): number => {
    return deg + (min / 60) + (sec / 3600);
  };

  if (configs[0].geo_format === "DMS") {
    // Convert from DMS to Decimal Degrees for Station 1
    const lat1 = convertDMSToDD(configs[0].latitude_deg, configs[0].latitude_min, configs[0].latitude_sec);
    const lon1 = convertDMSToDD(configs[0].longitude_deg, configs[0].longitude_min, configs[0].longitude_sec);

    // Convert from DMS to Decimal Degrees for Station 2
    const lat2 = convertDMSToDD(configs[1].latitude_deg, configs[1].latitude_min, configs[1].latitude_sec);
    const lon2 = convertDMSToDD(configs[1].longitude_deg, configs[1].longitude_min, configs[1].longitude_sec);

    // Log the converted coordinates
    console.log("Station 1 Coordinates (DMS to DD):", lat1, lon1);
    console.log("Station 2 Coordinates (DMS to DD):", lat2, lon2);

    // Convert to map coordinates and assign
    this.livelocationbuoy1 = fromLonLat([lon1, lat1]) as [number, number];
    this.buoy2 = fromLonLat([lon2, lat2]) as [number, number];

    console.log("Mapped Coordinates:", this.livelocationbuoy1, this.buoy2);

  } else if (configs[0].geo_format === "DD") {
    // Assume the latitude and longitude are in decimal degrees for both stations
    const lat1 = configs[0].latitude_deg;
    const lon1 = configs[0].longitude_deg;
    const lat2 = configs[1].latitude_deg;
    const lon2 = configs[1].longitude_deg;

    // Log the provided coordinates
    console.log("Station 1 Coordinates (DD):", lat1, lon1);
    console.log("Station 2 Coordinates (DD):", lat2, lon2);

    // Convert to map coordinates and assign
    this.livelocationbuoy1 = fromLonLat([lon1, lat1]) as [number, number];
    this.buoy2 = fromLonLat([lon2, lat2]) as [number, number];

    console.log("Mapped Coordinates:", this.livelocationbuoy1, this.buoy2);

  } else {
    console.error("Unknown geo_format encountered:", configs[0].geo_format);
    return false;
  }

  // If all went well, return true
  return true;
}





  constructor(private layout: LayoutComponent, private data:ConfigDataService) {}
  
  MapInit(): void {
    
    // this.assign();
    // if(status){
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const vectorSource = new VectorSource();
        
        this.vectorLayer = new VectorLayer({
          source: vectorSource,
        });
        
        this.createMarker(this.livelocationbuoy1, this.stationName1, vectorSource);
        this.createMarker(this.livelocationbuoy2, this.stationName2, vectorSource);
        this.createCircle(this.livelocationbuoy1, this.radius, 'red', vectorSource);
        this.createCircle(this.buoy2, this.radius, 'red', vectorSource);
        this.createCircle(this.livelocationbuoy1, this.wrange, 'yellow', vectorSource);
        this.createCircle(this.buoy2, this.wrange, 'yellow', vectorSource);
       
        this.map = new Map({
          view: new View({
            center: this.livelocationbuoy1,
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
                // this.layout.sensors();
                this.layout.page = 'Dashboard';
              }
            }
          });
        });
      }
    }, 2);
      
  // }
    
  }
  togglePaths() {
    this.showPaths = !this.showPaths; // Toggle the visibility flag

    const vectorSource = this.vectorLayer.getSource() as VectorSource;
    console.log('showPaths:', this.showPaths);
    console.log('Vector source features:', vectorSource.getFeatures());
    if (this.showPaths) {
      const traveledPath: [number, number][] = [
        
        this.livelocationbuoy1,
        fromLonLat([80.198665, 14.591018]) as [number , number],
        fromLonLat([80.196796, 14.591477]) as [number , number], 
        fromLonLat([80.195717, 14.590024]) as [number, number],
        fromLonLat([80.195927, 14.587961]) as [number, number],
        fromLonLat([80.198033, 14.587043]) as [number, number],
        fromLonLat([80.199560, 14.589617]) as [number, number],
      ];

      const traveledPath2: [number, number][] = [
        this.livelocationbuoy2,
        fromLonLat([80.185170, 14.619721]) as [number , number],
        fromLonLat([80.182909, 14.617035]) as [number , number], 
        fromLonLat([80.191029, 14.616439]) as [number, number],
        fromLonLat([80.194832, 14.621610]) as [number, number],
      ];

      this.createPathLine(traveledPath, vectorSource);
      this.createPathLine(traveledPath2, vectorSource);
    } else {
      // Optionally, clear paths when hiding
      vectorSource.clear(); // This clears all features; you can adapt to remove only the paths if needed
      this.createMarker(this.livelocationbuoy1, 'Buoy 1', vectorSource);
      this.createMarker(this.livelocationbuoy2, 'Buoy 2', vectorSource);
      this.createCircle(this.center, this.buoy1danger, 'red', vectorSource);
      this.createCircle(this.buoy2, this.buoy2danger, 'red', vectorSource);
      this.createCircle(this.center, this.bouy1wrange, 'yellow', vectorSource);
      this.createCircle(this.buoy2, this.buoy2wrange, 'yellow', vectorSource);
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
      const newCoords = this.livelocationbuoy1;
      const newcoords2 = this.livelocationbuoy2;
      const marker = vectorSource.getFeatures().find(f => f.get('name') === 'Buoy 1');
    
      if (marker) {
        marker.setGeometry(new Point(newCoords));
      }
    
      this.checkBuoyRange(newCoords);
      this.checkBuoyRange2(newcoords2);
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
