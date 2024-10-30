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
  import { HttpClient } from '@angular/common/http';
  import { FLOAT } from 'ol/webgl';
  import { ConfigDataService } from '../config-data.service';
  import { Config, StationConfigs } from '../../model/config.model';


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
    // tide:number = 0;
    // battery:number = 12.3;
    stations:StationConfigs[]=[];
    tideOffset:number = 0;
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
    
    latdeg!:number;
    latmin!:number;
    latsec!:number;
    langdeg!:number;
    langmin!:number;
    langsec!:number;
    sensor:Config[]=[];


    stationTypeSelect(){
      console.log("clicked")
      if(this.selectedStationType == this.stations[0].station_name){
        this.selectedcoordinate = this.stations[0].geo_format;
        if(this.selectedcoordinate == "DMS"){
          this.latdeg = this.stations[0].latitude_deg;
          this.latmin = this.stations[0].latitude_min;
          this.latsec = this.stations[0].latitude_sec;
          this.langdeg = this.stations[0].longitude_deg;
          this.langmin = this.stations[0].longitude_min;
          this.langsec = this.stations[0].longitude_sec;
          this.Lat = 0;
          this.Lang = 0;
        }else if(this.selectedcoordinate == "DD"){
          this.Lat = this.stations[0].latitude_dd;
          this.Lang = this.stations[0].longitude_dd;
          this.latdeg = 0;
          this.latmin = 0;
          this.latsec = 0;
          this.langdeg = 0;
          this.langmin = 0;
          this.langsec = 0;
        }
        this.Warning = this.stations[0].warning_circle;
        this.Danger = this.stations[0].danger_circle;
      }else if(this.selectedStationType == this.stations[1].station_name){
        this.selectedcoordinate = this.stations[1].geo_format;
        if(this.selectedcoordinate == "DMS"){
          this.latdeg = this.stations[1].latitude_deg;
          this.latmin = this.stations[1].latitude_min;
          this.latsec = this.stations[1].latitude_sec;
          this.langdeg = this.stations[1].longitude_deg;
          this.langmin = this.stations[1].longitude_min;
          this.langsec = this.stations[1].longitude_sec;
          this.Lat = 0;
          this.Lang = 0;
        }else if(this.selectedcoordinate == "DD"){
          this.Lat = this.stations[1].latitude_dd;
          this.Lang = this.stations[1].longitude_dd;
          this.latdeg = 0;
          this.latmin = 0;
          this.latsec = 0;
          this.langdeg = 0;
          this.langmin = 0;
          this.langsec = 0;
        }
        
        
        this.Warning = this.stations[1].warning_circle;
        this.Danger = this.stations[1].danger_circle;
      }
    }
    assign(){
    this.tideOffset =  parseFloat(this.sensor[0].value);
    this.selectedUnit = this.sensor[0].unit;  
    this.selectedcurrentUnit = this.sensor[1].unit;
    this.belowwarning = parseFloat(this.sensor[2].below_warning);
    this.abovewarning = parseFloat(this.sensor[2].above_warning);
    this.belowdanger=parseFloat(this.sensor[2].below_danger);
    this.abovedanger=parseFloat(this.sensor[2].above_danger);
    }
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
  ngOnInit(): void {
  this.data.getStationNames().subscribe(stations=>{
    this.stations = stations;
    
    for(let i in stations ){
      this.stationTypes.push(stations[i].station_name);
    }

    this.data.getsensorConfigs().subscribe(sensor=>{
      this.sensor = sensor;
      this.assign();
    })

  })
      this.RenderMap();
      
  }

  constructor (private staion:LayoutComponent, private http:HttpClient, private data:ConfigDataService){}
  map!: Map;
  center = fromLonLat([ 80.19146988481407,14.602590765602967]);
    RenderMap(): void {
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



    //updates
    onsensorSubmit() {
      console.log("tapped", this.slectedOption);
      let data: any = {}; 

      if (this.slectedOption === 'tide') {
          data = {
              sensor_type: this.slectedOption,
              value: this.tideOffset.toString(),
              unit: this.selectedUnit
          };
          console.log(data);  

      } else if (this.slectedOption === 'adcp') {
          data = {
              sensor_type: this.slectedOption,  
              unit: this.selectedcurrentUnit
          };
          console.log(data);

      } else if (this.slectedOption === 'battery') {
          data = {
              sensor_type: this.slectedOption.toString(),
              above_warning: this.abovewarning.toString(),
              below_warning: this.belowwarning.toString(),
              above_danger: this.abovedanger.toString(),
              below_danger: this.belowdanger.toString()
          };
          console.log(data);
      }

      this.http.put('http://localhost:3000/api/config', data).subscribe({
        next: (res) => {
          console.log(res);
        }
      })
  }


  onstationSubmit(){
  let stationConfigData = {
    
    };
    if(this.selectedcoordinate == 'DD'){
      stationConfigData = {
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
    this.http.put('http://localhost:3000/api/updatestationconfig',stationConfigData).subscribe(
      {
        next: (res) => {
          console.log('response station config ==', res);
        },
        error: (err) => {
          console.error('Error occurred:', err);
        } 
        
      }
    );
  }

  }
