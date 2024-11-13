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
  import { number, vector } from 'echarts';
  import { parseNumber } from 'devextreme/localization';
  import { UnitsComponent } from "../units/units.component";
  import { CommonModule } from '@angular/common';
  import { HttpClient } from '@angular/common/http';
  import { FLOAT } from 'ol/webgl';
  import { ConfigDataService } from '../config-data.service';
  import { Config, SensorData, SensorData2, sensorLiveData, StationConfigs } from '../../model/config.model';
import { Toast, ToastrService } from 'ngx-toastr';
import { MapService } from '../../map/map.service';
import { subscribe } from 'diagnostics_channel';



  @Component({
    selector: 'app-configurations',
    standalone: true,
    imports: [FormsModule, UnitsComponent, CommonModule],
    templateUrl: './configurations.component.html',
    styleUrl: './configurations.component.css'
  })
  export class ConfigurationsComponent implements OnInit {
    Lang!: number  ;
    Lat!: number  ;
    Warning!: number;
    Danger!:number;
    id!:string;
    // tide:number = 0;
    // battery:number = 12.3;
    stations:StationConfigs[]=[];
    tideOffset!:number;
    belowwarning: number = 0;
    abovewarning:number = 0;
    belowdanger:number = 0;
    abovedanger:number = 0;
    currentUnit:String = 'm/s';
    selectedStationType: string = '';  // Bind this to the dropdown
    stationTypes: string[] = [];
    selectedUnit: string = 'mtr';
  selectedcoordinate:string = 'DD';
    slectedOption: String = 'tide';
    selectedcurrentUnit: string = 'm/s'; // Default selected unit
    show:boolean = false;
    latdeg!:number;
    latmin!:number;
    latsec!:number;
    langdeg!:number;
    langmin!:number;
    langsec!:number;
    sensor:Config[]=[];
    stationName!:string;
    finallat!:number;
    finallang!:number;
    driftValue!:string;
    driftDirection!:string;
    liveloclat1!:number;
    liveloclang1!:number;
    liveloclat2!:number;
    liveloclang2!:number;
    liveData!:sensorLiveData;
    buoy1!:SensorData[];
    buoy2!:SensorData2[];
    checked:boolean= false;
     dmsToDd(degrees: number, minutes: number, seconds: number): number {
      return degrees + minutes / 60 + seconds / 3600;
    }

    haversineDistanceAndDirection(loc1: [number, number], loc2: [number, number]): { distance: number, direction: string } {
      const toRadians = (degree: number) => degree * (Math.PI / 180);
      const toDegrees = (radian: number) => radian * (180 / Math.PI);
    
      const R = 6371e3; // Radius of Earth in meters
      const φ1 = toRadians(loc1[1]);
      const φ2 = toRadians(loc2[1]);
      const Δφ = toRadians(loc2[1] - loc1[1]);
      const Δλ = toRadians(loc2[0] - loc1[0]);
    
      // Haversine formula to calculate distance
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in meters
    
      // Calculate the initial bearing (direction) in radians
      const x = Math.sin(Δλ) * Math.cos(φ2);
      const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
      let bearing = Math.atan2(x, y);
    
      // Convert bearing from radians to degrees
      bearing = toDegrees(bearing);
    
      // Normalize the bearing to be between 0 and 360 degrees
      bearing = (bearing + 360) % 360;
    
      // Map bearing to cardinal direction
      const directions = [
        { min: 0, max: 22.5, direction: 'N' },
        { min: 22.5, max: 67.5, direction: 'NE' },
        { min: 67.5, max: 112.5, direction: 'E' },
        { min: 112.5, max: 157.5, direction: 'SE' },
        { min: 157.5, max: 202.5, direction: 'S' },
        { min: 202.5, max: 247.5, direction: 'SW' },
        { min: 247.5, max: 292.5, direction: 'W' },
        { min: 292.5, max: 337.5, direction: 'NW' },
        { min: 337.5, max: 360, direction: 'N' }
      ];
    
      let direction = 'N'; // Default value
      for (const dir of directions) {
        if (bearing >= dir.min && bearing < dir.max) {
          direction = dir.direction;
          break;
        }
      }
    
      return { distance, direction };
    }
    
    

    travelPathAssign(){
      this.mapService.traveledPath = [];
      if(this.selectedStationType == "CWPRS01"){
        this.mapService.traveledPath.push(fromLonLat([this.buoy1[0].LONG, this.buoy1[0].LAT]) as [number,number]);
        for(let i=0; i<this.buoy1.length; i++){
          this.mapService.traveledPath.push(
            fromLonLat([this.buoy1[i].LONG, this.buoy1[i].LAT])as [number, number]
          );
        }
      }else if(this.selectedStationType == "CWPRS02"){
        this.mapService.traveledPath.push(fromLonLat([this.buoy2[0].LONG, this.buoy2[0].LAT]) as [number,number]);
        for(let i=0; i<this.buoy2.length; i++){
          this.mapService.traveledPath.push(
            fromLonLat([this.buoy2[i].LONG, this.buoy2[i].LAT])as [number, number]
          );
        }
      }
      
      // console.log(this.mapService.traveledPath);
    }

checking(){
  // this.mapService.destroyMap();
  this.checked = !this.checked;
  this.stationTypeSelect()
}
    stationTypeSelect() {
this.travelPathAssign();
      // console.log("Station selected:", this.selectedStationType);
    
      const selectedStation = this.stations.find(
        (station) => station.station_name === this.selectedStationType
      );
    
      if (selectedStation) {
        this.selectedcoordinate = selectedStation.geo_format;
    
        if (this.selectedcoordinate === "DMS") {
          // Set DMS values
          this.latdeg = selectedStation.latitude_deg;
          this.latmin = selectedStation.latitude_min;
          this.latsec = selectedStation.latitude_sec;
          this.langdeg = selectedStation.longitude_deg;
          this.langmin = selectedStation.longitude_min;
          this.langsec = selectedStation.longitude_sec;
          this.Lat = 0;
          this.Lang = 0;
          this.finallang= this.dmsToDd(this.langdeg, this.langmin, this.langsec);
          this.finallat = this.dmsToDd(this.latdeg, this.latmin,this.langsec);
        } else if (this.selectedcoordinate === "DD") {
          // Set DD values
          this.Lat = selectedStation.latitude_dd;
          this.Lang = selectedStation.longitude_dd;
          this.latdeg = 0;
          this.latmin = 0;
          this.latsec = 0;
          this.langdeg = 0;
          this.langmin = 0;
          this.langsec = 0;
        }
        this.stationName = selectedStation.station;
        this.Warning = selectedStation.warning_circle;
        this.Danger = selectedStation.danger_circle;
    
        // Update center and render the map with new station coordinates
        this.center = fromLonLat([this.Lang, this.Lat]);
        // console.log(this.center)
        if(this.selectedStationType == "CWPRS01"){
          const point1 = fromLonLat([this.finallang, this.finallat]) as [number, number];
          const point2 = fromLonLat([this.liveloclang1, this.liveloclat1]) as [number, number];
          // console.log("point1:== ", point1, this.center);
          // console.log("point2: ==", point2);
          const distance =   this.haversineDistanceAndDirection(point1, point2);
          // console.log(distance,'m');
          this.driftValue = distance.distance.toFixed(2);
          this.driftDirection = distance.direction;
        }else if(this.selectedStationType == "CWPRS02"){
          const point1 = fromLonLat([this.Lang, this.Lat]) as [number, number];
          const point2 = fromLonLat([this.liveloclang2, this.liveloclat2]) as [number, number];
          // console.log("point1:== ", point1);
          // console.log("point2: ==", point2);
          const distance =   this.haversineDistanceAndDirection(point1, point2);
          // console.log(distance,'m');
          this.driftValue = distance.distance.toFixed(2);
          this.driftDirection = distance.direction;
        }


        if(this.selectedcoordinate == "DD"){
          this.loadMapBasedOnStation(this.Lat, this.Lang, this.checked);
        }else if(this.selectedcoordinate == "DMS"){
          this.loadMapBasedOnStation(this.finallat, this.finallang, this.checked);
        }
        
      }else{
        this.show = false;
        this.mapService.destroyMap()
;      }
    }
    loadMapBasedOnStation(lat:number, lang:number, sho:boolean): void {
      this.mapService.destroyMap();
      const mapContainer = document.getElementById('ol-map');  // Target HTML element for map
      if (this.selectedStationType === 'CWPRS01') {
        // console.log("map:", mapContainer);
        this.mapService.createMap(mapContainer!, lat, lang, this.Warning, this.Danger, sho);
        this.show = true;
      } else if(this.selectedStationType == "CWPRS02"){
        // console.log("map:", mapContainer);
        this.mapService.createMap(mapContainer!, lat, lang, this.Warning, this.Danger, sho);
        this.show = true;
      }
      
      else {
        this.mapService.destroyMap();
      }
    }
    assign(){
    this.tideOffset =  parseFloat(this.sensor[0].value);
    this.selectedUnit = this.sensor[0].unit;  
    this.selectedcurrentUnit = this.sensor[1].unit;
    this.belowwarning = parseFloat(this.sensor[2].below_warning);
    this.abovewarning = parseFloat(this.sensor[2].above_warning);
    this.belowdanger=parseFloat(this.sensor[2].below_danger);
    this.abovedanger=parseFloat(this.staion.configs[2].above_danger);
    // console.log(this.tideOffset, this.selectedUnit, this.selectedcurrentUnit, 
    //   this.belowdanger,this.abovedanger, this.belowwarning, this.abovewarning
    // );
    
    }
    // Inside your ConfigurationsComponent class
    warningCircleStyle = new Style({
        stroke: new Stroke({
            color: 'yellow',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.2)', // Light red with transparency
        }),
    });
    
    dangerCircleStyle = new Style({
        stroke: new Stroke({
            color: 'red',
            width: 2,
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 0, 0.2)', // Light yellow with transparency
        }),
    });


    selecteoption(typee: String) {
    this.slectedOption = typee;
    // console.log(`selectedType : ${this.slectedOption}`);
    }

    selectUnit(unit: string) {
      this.selectedUnit = unit;
      // console.log(`Selected unit: ${this.selectedUnit}`);
    }
    selectcurrentUnit(unit: string) {
      this.selectedcurrentUnit = unit;
      // console.log(`Selected unit: ${this.selectedcurrentUnit}`);
    }
    selectcoordinate(unit: string) {
      this.selectedcoordinate = unit;
      // console.log(`Selected unit: ${this.selectedcoordinate}`);
    }
  ngOnInit(): void {
    this.data.getSensorLiveData('2024-01-01', '2024-11-8').subscribe(response=>{
      // console.log(response);
      this.liveData = response;
      this.buoy1 = this.liveData.buoy1;
      this.buoy2 = this.liveData.buoy2;

      this.liveloclat1 = this.buoy1[0].LAT
      this.liveloclat2 = this.buoy2[0].LAT
      this.liveloclang1 = this.buoy1[0].LONG
      this.liveloclang2 = this.buoy2[0].LONG
    })
  this.data.getStationNames().subscribe(stations=>{
    this.stations = stations;
    
    for(let i in stations ){
      this.stationTypes.push(stations[i].station_name);
    }

    this.data.getsensorConfigs().subscribe(sensor=>{
      this.sensor = sensor;
      // console.log("Sensors==", this.sensor);
      if(this.sensor != null){
        this.assign();

      }

    })

  })
      
      this.assign();
      this.map = new Map({
        target: 'ol-map',
        view: new View({
          center: this.center,
          zoom: 17,
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4',
            }),
          }),
        ],
      });
  }

  constructor (private staion:LayoutComponent, private http:HttpClient, private data:ConfigDataService, private taost:ToastrService, private mapService:MapService){}
  map!: Map;
  vectorLayer!: VectorLayer;
  map2!:Map;
  center = fromLonLat([ 80.19146988481407,14.602590765602967]);
  RenderMap(): void {
    
    // Initialize `this.map` if it hasn't been created yet
    if (!this.map) {
      this.map = new Map({
        view: new View({
          center: this.center,
          zoom: 17,
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4',
            }),
          }),
        ],
        target: 'ol-map',
      });
    }
  
    // Clear layers if `this.map` is already initialized
    else {
     
    }
   
  
    // Add layers
    const marker = new Feature({ geometry: new Point(this.center) });
    marker.setStyle(new Style({
      image: new Icon({ src: '../../assets/buoy.png', scale: 0.04 })
    }));
  
    const circleFeature = new Feature({
      geometry: new Circle(this.center, this.Warning),
    });
    circleFeature.setStyle(new Style({
      stroke: new Stroke({ color: 'yellow', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
  
    const circleFeature2 = new Feature({
      geometry: new Circle(this.center, this.Danger),
    });
    circleFeature2.setStyle(new Style({
      stroke: new Stroke({ color: 'red', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
  
    const vectorSource = new VectorSource({ features: [marker, circleFeature, circleFeature2] });
    const vectorLayer = new VectorLayer({ source: vectorSource });
    
    // Add `vectorLayer` to the map
    this.map.addLayer(vectorLayer);
    // this.map.getLayers().clear();
  }
  
  RenderMap2(): void {
    
    // Same logic as RenderMap for `this.map2`
    if (!this.map2) {
      this.map2 = new Map({
        view: new View({
          center: this.center,
          zoom: 17,
        }),
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=c30d4b0044414082b818c93c793707a4',
            }),
          }),
        ],
        target: 'ol-map',
      });
    } else {
      this.map2.getLayers().clear();
    }
  
    const marker = new Feature({ geometry: new Point(this.center) });
    marker.setStyle(new Style({
      image: new Icon({ src: '../../assets/buoy.png', scale: 0.04 })
    }));
  
    const circleFeature = new Feature({
      geometry: new Circle(this.center, this.Warning),
    });
    circleFeature.setStyle(new Style({
      stroke: new Stroke({ color: 'yellow', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
  
    const circleFeature2 = new Feature({
      geometry: new Circle(this.center, this.Danger),
    });
    circleFeature2.setStyle(new Style({
      stroke: new Stroke({ color: 'red', width: 2 }),
      fill: new Fill({ color: 'rgba(0, 0, 255, 0.1)' }),
    }));
  
    const vectorSource = new VectorSource({ features: [marker, circleFeature, circleFeature2] });
    const vectorLayer = new VectorLayer({ source: vectorSource });
    
    // Add `vectorLayer` to the map
    this.map2.addLayer(vectorLayer);
  }
  
  
    clickon(typr:String){
      // console.log(typr);
    }



    //updates
    onsensorSubmit() {
      // console.log("tapped", this.slectedOption);
      let data: any = {}; 

      if (this.slectedOption === 'tide') {
          data = {
              sensor_type: this.slectedOption,
              value: this.tideOffset.toString(),
              unit: this.selectedUnit
          };
          // console.log(data);  

      } else if (this.slectedOption === 'adcp') {
          data = {
              sensor_type: this.slectedOption,  
              unit: this.selectedcurrentUnit
          };
          // console.log(data);

      } else if (this.slectedOption === 'battery') {
          data = {
              sensor_type: this.slectedOption.toString(),
              above_warning: this.abovewarning.toString(),
              below_warning: this.belowwarning.toString(),
              above_danger: this.abovedanger.toString(),
              below_danger: this.belowdanger.toString()
          };
          // console.log(data);
      }

      this.http.put('http://192.168.0.109:3000/api/config', data).subscribe({
        next: (res) => {
          // console.log(res);
          this.taost.success("Sensor settings Updated", "Success");
        },
        error: (err) => {
          this.taost.error("Sensor settings not updated", "Please try again");
        }
      })
  }


  onstationSubmit(){
  let stationConfigData = {
    
    };
    if(this.selectedcoordinate == 'DD'){
      stationConfigData = {
        station:this.stationName,
        station_name: this.selectedStationType,
        warning_circle: this.Warning,
        danger_circle: this.Danger,
        geo_format: this.selectedcoordinate, // or 'DMS'
        latitude_dd: this.Lat,
        longitude_dd: this.Lang,
        latitude_deg: null,
        latitude_min: null,
        latitude_sec: null,
        longitude_deg: null,
        longitude_min: null,
        longitude_sec: null,
      }
    }else if(this.selectedcoordinate == 'DMS'){
      stationConfigData = {
        station:this.stationName,
        station_name: this.selectedStationType,
        warning_circle: this.Warning,
        danger_circle: this.Danger,
        geo_format: this.selectedcoordinate, // or 'DMS'
        latitude_dd: null,
        longitude_dd: null,
        latitude_deg: this.latdeg,
        latitude_min: this.latmin,
        latitude_sec: this.latsec,
        longitude_deg: this.langdeg,
        longitude_min: this.langmin,
        longitude_sec: this.langsec,
      }
    }
    this.http.put('http://192.168.0.109:3000/api/updatestationconfig',stationConfigData).subscribe(
      {
        next: (res) => {
          // console.log('response station config ==', res);
          this.taost.success("Station Configuration updated", "Success");
        },
        error: (err) => {
          // console.error('Error occurred:', err);
          this.taost.error("Error Updating Station Configuration", "Please try again");
        } 
        
      }
    );
  }



  

  }
