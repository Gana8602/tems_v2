import { CommonModule } from '@angular/common';
import {Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpClient, } from '@angular/common/http';

import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';

import * as echarts from 'echarts';
// import { PlotlyModule } from 'angular-plotly.js';
// import Plotly from 'plotly.js-dist-min'; 


import { StationService, buoys, BuoyData} from '../station_service/station.service';
import { time } from 'console';
interface currentModel{
  time:string,
  speed:number,
  direction:number,
}
interface Tide{
  date:string,
  level:number
}
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, MultiSelectModule, DropdownModule, CalendarModule
    // CommonModule, RouterOutlet, CanvasJSAngularChartsModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
  providers:[StationService]
})
export class AnalyticsComponent implements AfterViewInit{
  sampleDataTide:Tide[] = [];
  sampleData:currentModel[] = [
    ];
    sampleData2:currentModel[] = [
    ];
    sampleData3:currentModel[] = [
    ];

    sampleData4:currentModel[] = [
    ];
   
  selectedStation: string = 'cwprs1';
  selectedPeriod: string = 'dateRange';
  selectedChart: string = 'line';
  selectedSensor: String = '';

  stationOptions = [
    { label: 'Cwprs 1', value: 'cwprs1' },
    { label: 'Cwprs 2', value: 'cwprs2' },
  ];
  periodOptions = [
    { label: 'Date Range', value: 'dateRange' },
    { label: 'Week Range', value: 'weekRange' },
    { label: 'Month Range', value: 'monthRange' },
    { label: 'Year Range', value: 'yearRange' }
  ];
chartOptions = [
  { label: 'Time Series', value: 'line' },
  { label: 'Scatter Series', value: 'scatter' },
  { label: 'Bar Series', value: 'bar' },
  { label: 'Polar Series', value: 'currentSpeed' }
];

cwprs1: BuoyData[] = [];
cwprs2: BuoyData[] = [];

fromDate =new Date();
toDate = new Date();
selectedWeek =new Date();
selectedMonth =new Date();
selectedYear =new Date();
  
isSpeedChecked: boolean = true;
isCurrentChecked: boolean = true;

SubmitedslectedOption: String = '';
chartOption: any;
loading: boolean = false;

constructor(private stationService: StationService, private http:HttpClient, private cd: ChangeDetectorRef) {}

onPeriodChange(event: any) {
  console.log('Selected period:', event.value);
}

selectSensorOption(typee: String) {
this.selectedSensor = typee;
this.onSensorChange();
console.log(`selectedType : ${this.selectedSensor}`);
}

onSensorChange() {
  if (this.selectedSensor === 'adcp') {
    this.chartOptions = [
      { label: 'Time Series', value: 'line' },
      { label: 'Scatter Series', value: 'scatter' },
      { label: 'Bar Series', value: 'bar' },
      { label: 'Polar Series', value: 'currentSpeed' }
    ];
  } else {
    this.chartOptions = [
      { label: 'Time Series', value: 'line' },
      { label: 'Scatter Series', value: 'scatter' },
      { label: 'Bar Series', value: 'bar' }
    ];
  }
}

  // onSubmit(){
  //   this.SubmitedslectedOption = this.selectedSensor;
  //   console.log('Submitted selected option:', this.selectedSensor);
  //   console.log('Selected chart type:', this.selectedChart);  
  //   setTimeout(()=>{
  //     if(this.SubmitedslectedOption == 'tide' && this.selectedChart){
  //       this.Tide();
  //     }else if(this.SubmitedslectedOption == 'adcp'){
  //       this.surfaceSpeedDirection();
  //       this.midSpeedDirection();
  //       this.bottomSpeedDirection();
  //       // this.polar1();
  //       // this.polar2();
  //       // this.windRosePlot();
  //       // this.createWindRosePlot();
  //     }
  //   },0);
   
  // }


  // fetchStations() {
  //   this.loading = true;
  //   let formattedFromDate: string | null = null;
  //   let formattedToDate: string | null = null;
  
  //   if (!this.selectedPeriod) {
  //     formattedFromDate = this.fromDate.toLocaleDateString('en-CA');  // Format as YYYY-MM-DD
  //     formattedToDate = this.toDate.toLocaleDateString('en-CA');      // Same for both (one-day range)
  //   } else {
  
  //   switch (this.selectedPeriod) {
  //     case 'dateRange':
  //       formattedFromDate = this.fromDate ? this.fromDate.toLocaleDateString('en-CA') : null;
  //       formattedToDate = this.toDate ? this.toDate.toLocaleDateString('en-CA') : null;
  //       break;
        
  //       case 'weekRange':
  //         formattedFromDate = this.selectedWeek ? this.selectedWeek.toLocaleDateString('en-CA') : null;
  //         const weekEndDate = this.selectedWeek ? this.getWeekEndDate(this.selectedWeek) : null;
  //         formattedToDate = weekEndDate ? weekEndDate.toLocaleDateString('en-CA') : null;
  //         break;
        
  //         case 'monthRange':
  //           formattedFromDate = this.selectedMonth ? `${this.selectedMonth.getFullYear()}-${(this.selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01` : null;
  //           const monthEndDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
  //           formattedToDate = monthEndDate ? monthEndDate.toLocaleDateString('en-CA') : null;
  //           break;
        
  //           case 'yearRange':
  //             // Extract the year from the Date object and format the year range
  //             const year = this.selectedYear.getFullYear(); // Extracting just the year part
  //             formattedFromDate = `${year}-01-01`;
  //             formattedToDate = `${year}-12-31`;   // Last day of the year
  //       break;
  
  //     default:
  //       // Handle invalid period or no period selected
  //       break;
  //   }
  // }
  
  //   console.log(`Formatted From Date: ${formattedFromDate}, Formatted To Date: ${formattedToDate}`);
  
  
  //   this.stationService.getStations(formattedFromDate!, formattedToDate!).subscribe(
  //     (data: buoys) => {
  //       console.log('API Response:', JSON.stringify(data, null, 2)); 
  //       this.cwprs1 = data.buoy1
  //       this.cwprs2 = data.buoy2
  //       this.loading = false;
  //     },
  //     error => {
  //       console.error('Error fetching buoy data', error);
  //       this.loading = false;
  //     }
  //   );
  // }
  
  getWeekEndDate(startDate: Date): Date {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);  // Add 6 days to get the week end
    return endDate;
  }


  onSubmitAndFetch() {
    this.sampleDataTide = [];
    this.sampleData = [];
    this.sampleData2 = [];
    this.sampleData3 = [];
    this.SubmitedslectedOption = this.selectedSensor;
    console.log('Submitted selected option:', this.selectedSensor);
    console.log('Selected chart type:', this.selectedChart);
  
    // Format date range for fetching data
    let formattedFromDate: string | null = null;
    let formattedToDate: string | null = null;
  
    if (!this.selectedPeriod) {
      formattedFromDate = this.fromDate.toLocaleDateString('en-CA');  // Format as YYYY-MM-DD
      formattedToDate = this.toDate.toLocaleDateString('en-CA');      // Same for both (one-day range)
    } else {
      switch (this.selectedPeriod) {
        case 'dateRange':
          formattedFromDate = this.fromDate ? this.fromDate.toLocaleDateString('en-CA') : null;
          formattedToDate = this.toDate ? this.toDate.toLocaleDateString('en-CA') : null;
          break;
        case 'weekRange':
          formattedFromDate = this.selectedWeek ? this.selectedWeek.toLocaleDateString('en-CA') : null;
          const weekEndDate = this.selectedWeek ? this.getWeekEndDate(this.selectedWeek) : null;
          formattedToDate = weekEndDate ? weekEndDate.toLocaleDateString('en-CA') : null;
          break;
        case 'monthRange':
          formattedFromDate = this.selectedMonth ? `${this.selectedMonth.getFullYear()}-${(this.selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01` : null;
          const monthEndDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
          formattedToDate = monthEndDate ? monthEndDate.toLocaleDateString('en-CA') : null;
          break;
        case 'yearRange':
          const year = this.selectedYear.getFullYear();
          formattedFromDate = `${year}-01-01`;
          formattedToDate = `${year}-12-31`;
          break;
        default:
          break;
      }
    }
  
    console.log(`Formatted From Date: ${formattedFromDate}, Formatted To Date: ${formattedToDate}`);
  
    // Fetch station data based on the date range
    this.loading = true;
    this.stationService.getStations(formattedFromDate!, formattedToDate!).subscribe(
      (data: buoys) => {
        console.log('API Response:', JSON.stringify(data, null, 2));
        this.cwprs1 = data.buoy1.map(buoy => ({
          ...buoy,
          SurfaceSpeed: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[0],
          SurfaceDirection: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[1],
          MiddleSpeed: buoy.Middle_CurrentSpeedDirection?.split(';')[0],
          MiddleDirection: buoy.Middle_CurrentSpeedDirection?.split(';')[1],
          LowerSpeed: buoy.Lower_CurrentSpeedDirection?.split(';')[0],
          LowerDirection: buoy.Lower_CurrentSpeedDirection?.split(';')[1],
        }));
        this.cwprs2 = data.buoy2.map(buoy => ({
          ...buoy,
          SurfaceSpeed: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[0],
          SurfaceDirection: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[1],
          MiddleSpeed: buoy.Middle_CurrentSpeedDirection?.split(';')[0],
          MiddleDirection: buoy.Middle_CurrentSpeedDirection?.split(';')[1],
          LowerSpeed: buoy.Lower_CurrentSpeedDirection?.split(';')[0],
          LowerDirection: buoy.Lower_CurrentSpeedDirection?.split(';')[1],
        }));
        this.loading = false;
  
        // After fetching station data, trigger the appropriate action based on selectedSensor
        setTimeout(() => {
          if (this.SubmitedslectedOption === 'tide' && this.selectedChart) {
            this.Tide();
          } else if (this.SubmitedslectedOption === 'adcp') {
            this.surfaceSpeedDirection();
            this.midSpeedDirection();
            this.bottomSpeedDirection();
            this.polar();
            // Optionally, uncomment if needed:
            // this.polar1();
            // this.polar2();
            // this.windRosePlot();
            // this.createWindRosePlot();
          }
        }, 0);
      },
      error => {
        console.error('Error fetching buoy data', error);
        this.loading = false;
      }
    );
  }


  ngAfterViewInit() {
    this.Tide();
    this.surfaceSpeedDirection();
  }  

Tide(): void {

  const chartType = this.selectedChart;
    this.loading = true;
    const tide = document.getElementById('tide');
    
    
   
      
      if(this.selectedStation.toLowerCase() == "cwprs1"){
        for(let i in this.cwprs1 ){
          this.sampleDataTide.push({date:this.cwprs1[i].Date, level: parseFloat(this.cwprs1[i].S1_RelativeWaterLevel)});
        }
      }else if(this.selectedStation.toLowerCase() == "cwprs2"){
        for(let i in this.cwprs2 ){
          this.sampleDataTide.push({date:this.cwprs2[i].Date, level: parseFloat(this.cwprs2[i].S1_RelativeWaterLevel)});
        }
      }
    

     
    if (tide) {
      const existingInstance = echarts.getInstanceByDom(tide);
      if(existingInstance){
         existingInstance.dispose();
      }
      const tideLevel = echarts.init(tide);
  
    const waterLevels = this.selectedStation === 'cwprs1' ? this.cwprs1.map(item => item.S1_RelativeWaterLevel) : 
                        this.selectedStation === 'cwprs2' ? this.cwprs2.map(item => item.S1_RelativeWaterLevel) : []

    const dates = this.selectedStation === 'cwprs1' ? this.cwprs1.map(item =>`${item.Date?.split('T')[0]} ${item.Time?.split('T')[1]?.split('.')[0]}`) :
                  this.selectedStation === 'cwprs2' ? this.cwprs2.map(item =>`${item.Date?.split('T')[0]} ${item.Time?.split('T')[1]?.split('.')[0]}`) : []
                  
    // const dates = this.cwprs1.map(item =>`${item.Date?.split('T')[0]}`);
    
 
      
    const option = {
        title: {
          text: 'Tide',
           left: '1%',
           textStyle: {
            color : '#1ee1ff',
            fontSize: 20
           }
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          // top: '50%',
          left: '7%',
          right: '10%',
          bottom: '30%',
          // containLabel: true
        },
        xAxis: {
          type: 'time',
          name: 'Date',  // X-axis legend (title)
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#1ee1ff',
            padding: [35, 0, 0, 0],
            fontSize: 16         
          },
          // data: dates,
          axisLabel: {
            color: '#fff', // Set x-axis label color to white
            rotate: 45,
            
          },
          axisLine:{
            show:true
          },
          splitLine: {
            show: false // Hide x-axis grid lines
          }
        },
        
        yAxis: {
          name: 'Water Level (cm/s)',  // Y-axis legend (title)
          nameLocation: 'middle',
          nameTextStyle: {
            color: '#1ee1ff',
            padding: 35,  // Adjust to space it well from the axis
            fontSize: 16   
          },
          // type: 'value'
          axisLabel: {
            color: '#fff' // Set y-axis label color to white
          },
          axisLine:{
            show:true,
           
          },
          splitLine: {
            show: true, // Hide x-axis grid lines
            lineStyle: {
              // color: '#fff', 
              type: 'dashed'
            }
          }
        },
  
        legend: {
          // type: 'scroll',
          orient: 'vertical',  // Orient the legend vertically
          right: '10%', 
          top: '3%',
          // top: 'middle',
          textStyle: {
            color: '#fff', // Set legend text color to white
            fontSize: 14
          }          
        },

        toolbox: {
          right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: 'none',
              title: {
                zoom: 'Zoom',
                back: 'Reset Zoom'
              }
            },
            restore: {},
            saveAsImage: {
              backgroundColor: 'black',
              pixelRatio: 2,
            }
          },
          iconStyle: {
            borderColor: '#1ee1ff'
          }
        },
        
        dataZoom: [
          {
            type: 'slider',
            bottom: 15,
            height: 20,
            start: 0,  // You can adjust to define how much of the chart is visible initially
            end: 100,  // Set the percentage of the range initially visible
          },
          {
            type: 'inside',
            start: 0,
            end: 100,  // Can be modified based on your dataset's initial view preference
            zoomOnMouseWheel: true,
            moveOnMouseMove: true
          }
        ],
        
        
        series: [
          {
            name: 'Water Level',
            // data:  dates.map((date, index) => ({ value: [date, waterLevels[index]] })),
            data: this.sampleDataTide.map(item => [item.date, item.level]),
            type: chartType === 'bar' ? 'bar'  : chartType,
            smooth: chartType === 'line',
            lineStyle: chartType === 'line' ? { color: '#1ee1ff' } : { color: 'orange' },
            barWidth: chartType === 'bar' ? '50%' : undefined,

            itemStyle: {
              color: '#1ee1ff'
            },
            showSymbol: false,
            label: {
              show: false,
              fontSize: 12  // Optional: Set font size for the data points (if labels are enabled)
            },
            
          },

        ]
        };
      
        // Set options for the chart
        tideLevel.setOption(option);
        this.loading = false;
        window.addEventListener('resize', () => {
          tideLevel.resize();
          console.log('Chart type applied:', chartType);
      }); 
      } 
      else {
        console.error("Element with id 'waterLevel1' not found");
        this.loading = false;
      }
    }
    

surfaceSpeedDirection(): void {
  const chartType = this.selectedChart;
  this.loading = true;
  const surface = document.getElementById('surfaceSpeedDirection');
  if(this.selectedStation.toLowerCase() == "cwprs1"){
    for(let i in this.cwprs1 ){
      const [speedStr, directionStr] = this.cwprs1[i].S2_SurfaceCurrentSpeedDirection.split(';');

      // Convert the string parts to numbers
      const speed = parseFloat(speedStr);
      const direction = parseFloat(directionStr);
      this.sampleData.push(
       {time: this.cwprs1[i].Date,       // Assuming 'Date' holds the time value
        speed: speed,     // Assuming 'speed' is available in 'cwprs1'
        direction: direction}
      );
    }
  }else if(this.selectedStation.toLowerCase() == "cwprs2"){
    for(let i in this.cwprs2 ){
      const [speedStr, directionStr] = this.cwprs2[i].S2_SurfaceCurrentSpeedDirection.split(';');

      // Convert the string parts to numbers
      const speed = parseFloat(speedStr);
      const direction = parseFloat(directionStr);
      this.sampleData.push(
       {time: this.cwprs2[i].Date,       // Assuming 'Date' holds the time value
        speed: speed,     // Assuming 'speed' is available in 'cwprs1'
        direction: direction}
      );
    }
  }      
  if(surface){
            const existingInstance = echarts.getInstanceByDom(surface);
            if (existingInstance) {
              existingInstance.dispose();
            }
    const speedDirection = echarts.init(surface);

  const surfaceCurrent = this.selectedStation === 'cwprs1' ? this.cwprs1.map(item => item.S2_SurfaceCurrentSpeedDirection) : 
                         this.selectedStation === 'cwprs2' ? this.cwprs2.map(item => item.S2_SurfaceCurrentSpeedDirection) : []

  const dates =  this.selectedStation === 'cwprs1' ? this.cwprs1.map(item =>`${item.Date?.split('T')[0]} ${item.Time?.split('T')[1]?.split('.')[0]}`) :
                 this.selectedStation === 'cwprs2' ? this.cwprs2.map(item =>`${item.Date?.split('T')[0]} ${item.Time?.split('T')[1]?.split('.')[0]}`) : []
  // const dates = this.cwprs1.map(item =>`${item.Date?.split('T')[0]}`);
  

    // Prepare chart options
    const option = {
        title: {
            text: 'Surface',
            left: '1%',
            textStyle: {
                color: '#1ee1ff',
                fontSize: 20
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            left: '7%',
            right: '10%',
            bottom: '22%',
        },
        xAxis: {
          // '#ffcc00' // yellow code
            type: 'time', // Set x-axis type to time
            name: 'Time',
            nameLocation: 'middle',
            nameTextStyle: {
                color: '#1ee1ff',
                padding: [15, 0, 0, 0],
                fontSize: 16         
            },
            axisLabel: {
                color: '#fff' // Set x-axis label color to white
            },
            axisLine: {
                show: true
            },
            splitLine: {
                show: false // Hide x-axis grid lines
            }
        },
        
        yAxis: [ 
          ...(this.isSpeedChecked ? [
            {
              type: 'value',
              name: 'Current speed (m/s)',  // Left Y-axis title
              nameLocation: 'middle',
              nameTextStyle: {
                  color: '#1ee1ff',
                  padding: 35,  // Adjust spacing
                  fontSize: 16,
                  // margin: 20  
              },
              axisLabel: {
                  color: '#fff', // Set y-axis label color to white
                  //  formatter: '{value} m/s'
              },
              axisLine: {
                  show: true,
                  lineStyle: {
                    color: '#ffcc00'
                  }
              },
              splitLine: {
                  show: true, // Show grid lines
                  lineStyle: {
                    type: 'solid', // Solid gridlines for yAxis 0 (left axis)
                    color: '#ffcc00'
                } 
              }
          }
          ] : []),

          ...(this.isCurrentChecked ? [
            {
              type: 'value',
              name: 'Current Direction (°)',  
              nameLocation: 'middle',
              nameTextStyle: {
                  color: '#1ee1ff',
                  padding: 35,  // Adjust spacing
                  fontSize: 16   
              },
              axisLabel: {
                  color: '#fff', // Set y-axis label color to white
                  //  formatter: '{value}°'
              },
              axisLine: {
                  show: true,
                  lineStyle: {
                    color: 'red'
                }
              },
              splitLine: {
                  show: true, // Show grid lines
                  lineStyle: {
                    type: 'dashed', // Dashed gridlines for yAxis 1 (right axis)
                    color: 'red'
                }
              },
              position: this.isSpeedChecked && this.isCurrentChecked ? 'right' : '', 
              min: 0,   
              max: 360, 
              interval: 90, 
          }
          ] : [])        
        ],

        legend: {
          data: [
            ...(this.isSpeedChecked ? ['Current Speed (m/s)'] : []),
            ...(this.isCurrentChecked ? ['Current Direction (°)'] : [])
          ],
          // data: ['Current Speed (m/s)', 'Current Direction (°)'], 
          orient: 'vertical',
          right: '10%',
          textStyle: {
              color: '#fff',
              fontSize: 14
          }
      },
      
        toolbox: {
            right: 10,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            },
            iconStyle: {
                borderColor: '#1ee1ff'
            }
        },
        
        dataZoom: [
          {
            type: 'inside',  // Enable interactive zooming
            xAxisIndex: 0,   // Apply zooming to the x-axis (time axis)
            filterMode: 'filter',  // Filter out of view data
            start: 0,        // Start position for zooming (0%)
            end: 100         // End position for zooming (100%)
          },
          {
            type: 'slider',  // Enable zooming via a slider below the x-axis
            xAxisIndex: 0,   // Apply slider to the x-axis
            filterMode: 'filter', 
            start: 0,        // Start position for zooming
            end: 100         // End position for zooming
          },
          {
            type: 'inside',  // Enable vertical zooming for y-axis 0 (speed)
            yAxisIndex: 0,   // Bind zoom to the left y-axis (speed)
            filterMode: 'filter',
            start: 0,
            end: 100
          },
          ...(this.isSpeedChecked && this.isCurrentChecked ? [{
            type: 'inside',  // Enable vertical zooming for y-axis 1 (direction)
            yAxisIndex: 1,   // Bind zoom to the right y-axis (direction)
            filterMode: 'filter',
            start: 0,
            end: 100
          }] : [])
        ],
      
        
        series: [
          ...(this.isSpeedChecked ? [{
            name: 'Current Speed (m/s)',
            // data:  dates.map((date, index) => ({ value: [date, surfaceCurrent[index]?.split(';')[0]] })), 
            data: this.sampleData.map(item => [item.time, item.speed]),
            type: chartType === 'bar' ? 'bar' : chartType,
            lineStyle: { normal: { color: 'orange' } },
            itemStyle: { color: 'orange' },
            showSymbol: false,
            yAxisIndex: 0 // Bind to left y-axis
          }] : []),
  
          ...(this.isCurrentChecked ? [{
            name: 'Current Direction (°)',
            data: this.sampleData.map(item => [item.time, item.direction]),
            // data: dates.map((date, index) => ({ value: [date, surfaceCurrent[index]?.split(';')[1]] })),
            type:  chartType,
            lineStyle: { normal: { color: 'red', type: 'dashed' } },
            itemStyle: { color: 'red' },
            showSymbol: true,
            yAxisIndex: this.isSpeedChecked ? 1 : 0 // Bind to right y-axis
          }] : [])
        ]
    };

    // Set options for the chart
    speedDirection.setOption(option);
    this.loading = false;
    window.addEventListener('resize', () => {
      speedDirection.resize();
  }); 
      } 
      else {
        console.error("Element with id 'waterLevel1' not found");
        this.loading = false;
      }
    }
    

midSpeedDirection(): void {
  const chartType = this.selectedChart
        this.loading = true;
        const mid = document.getElementById('midSpeedDirection');
        if(this.selectedStation.toLowerCase() == "cwprs1"){
          for(let i in this.cwprs1 ){
            const [speedStr, directionStr] = this.cwprs1[i].Middle_CurrentSpeedDirection.split(';');
      
            // Convert the string parts to numbers
            const speed = parseFloat(speedStr);
            const direction = parseFloat(directionStr);
            this.sampleData2.push(
             {time: this.cwprs1[i].Date,       // Assuming 'Date' holds the time value
              speed: speed,     // Assuming 'speed' is available in 'cwprs1'
              direction: direction}
            );
          }
        }else if(this.selectedStation.toLowerCase() == "cwprs2"){
          for(let i in this.cwprs2 ){
            const [speedStr, directionStr] = this.cwprs2[i].Middle_CurrentSpeedDirection.split(';');
      
            // Convert the string parts to numbers
            const speed = parseFloat(speedStr);
            const direction = parseFloat(directionStr);
            this.sampleData2.push(
             {time: this.cwprs2[i].Date,       // Assuming 'Date' holds the time value
              speed: speed,     // Assuming 'speed' is available in 'cwprs1'
              direction: direction}
            );
          }
        }      
        if (mid) {
                const existingInstance = echarts.getInstanceByDom(mid);
                if(existingInstance){
                  existingInstance.dispose();
                }
          const midspeedanddirection = echarts.init(mid);
              
          // Prepare chart options
          const option = {
              title: {
                  text: 'Mid',  // Changed title to 'Mid'
                  left: '1%',
                  textStyle: {
                      color: '#1ee1ff',
                      fontSize: 20
                  }
              },
              tooltip: {
                  trigger: 'axis',
              },
              grid: {
                  left: '7%',
                  right: '10%',
                  bottom: '22%',
              },
              xAxis: {
                  type: 'time', // Set x-axis type to time
                  name: 'Time',
                  nameLocation: 'middle',
                  nameTextStyle: {
                      color: '#1ee1ff',
                      padding: [15, 0, 0, 0],
                      fontSize: 16         
                  },
                  axisLabel: {
                      color: '#fff' // Set x-axis label color to white
                  },
                  axisLine: {
                      show: true
                  },
                  splitLine: {
                      show: false // Hide x-axis grid lines
                  }
              },
              
              yAxis: [
                ...(this.isSpeedChecked ? [
                  {
                    type: 'value',
                    name: 'Current speed (m/s)',  // Left Y-axis title
                    nameLocation: 'middle',
                    nameTextStyle: {
                        color: '#1ee1ff',
                        padding: 35,  // Adjust spacing
                        fontSize: 16,
                        // margin: 20  
                    },
                    axisLabel: {
                        color: '#fff', // Set y-axis label color to white
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                          color: '#00ff00'  // Updated color to green
                        }
                    },
                    splitLine: {
                        show: true, // Show grid lines
                        lineStyle: {
                          type: 'solid', // Solid gridlines for yAxis 0 (left axis)
                          color: '#00ff00'  // Updated to green
                      } 
                    }
                }
                ] : []),

                ...(this.isCurrentChecked ? [
                  {
                    type: 'value',
                    name: 'Current Direction (°)',  
                    nameLocation: 'middle',
                    nameTextStyle: {
                        color: '#1ee1ff',
                        padding: 35,  // Adjust spacing
                        fontSize: 16   
                    },
                    axisLabel: {
                        color: '#fff', // Set y-axis label color to white
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                          color: '#0000ff'  // Updated color to blue
                      }
                    },
                    splitLine: {
                        show: true, // Show grid lines
                        lineStyle: {
                          type: 'dashed', // Dashed gridlines for yAxis 1 (right axis)
                          color: '#0000ff'  // Updated to blue
                      }
                    },
                    position: this.isSpeedChecked && this.isCurrentChecked ? 'right' : '', // Position the axis on the right
                    min: 0,   // Set minimum value
                    max: 360, // Set maximum value
                    interval: 90, // Set interval between tick marks
                }
                ] : []),
              ],
      
              legend: {
                data: [
                  ...(this.isSpeedChecked ? ['Current Speed (m/s)'] : []),
                  ...(this.isCurrentChecked ? [ 'Current Direction (°)'] : [])
                  ], // Make sure this matches series names
                orient: 'vertical',
                right: '10%',
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                }
            },
            
              toolbox: {
                  right: 10,
                  feature: {
                      dataZoom: {
                          yAxisIndex: 'none'
                      },
                      restore: {},
                      saveAsImage: {}
                  },
                  iconStyle: {
                      borderColor: '#1ee1ff'
                  }
              },
              
              dataZoom: [
                  {
                      type: 'slider',
                      start: 0,
                      end: 100
                  },
                  {
                      type: 'inside'
                  }
              ],
              
              series: [
                ...(this.isSpeedChecked ? [
                  {
                    name: 'Current Speed (m/s)',
                    data: this.sampleData2.map(item => [item.time, item.speed]), // Use timestamp for x value
                    type: chartType,
                    lineStyle: {
                        normal: {
                            color: '#00ff00',  // Updated line color to green
                        }
                    },
                    itemStyle: {
                        color: '#00ff00'  // Updated item color to green
                    },
                    showSymbol: false,
                    label: {
                        show: false,
                        fontSize: 12
                    },
                    yAxisIndex: 0 // Bind to left y-axis
                }
                ] : []),

                  ...(this.isCurrentChecked ? [
                    {
                      name: 'Current Direction (°)',
                      data: this.sampleData.map(item => [item.time, item.direction]), // Use timestamp for x value
                      type: chartType,
                      lineStyle: {
                          normal: {
                              color: '#0000ff',  // Updated line color to blue
                              type: 'dashed'
                          }
                      },
                      itemStyle: {
                        color: '#0000ff'  // Updated item color to blue
                      },
                      showSymbol: true,
                      label: {
                          show: false,
                          fontSize: 12
                      },
                      yAxisIndex: this.isSpeedChecked && this.isCurrentChecked ? 1 : 0 // Bind to right y-axis
                  } 
                  ] : [])   
              ]
          };
      
          // Set options for the chart
          midspeedanddirection.setOption(option);
          this.loading = false;
          window.addEventListener('resize', () => {
            midspeedanddirection.resize();
          }); 
        } else {
          console.error("Element with id 'midspeedanddirection' not found");
          this.loading = false;
        }
      }

bottomSpeedDirection(): void {
        const chartType = this.selectedChart
        this.loading = true;
        const bottom = document.getElementById('bottomSpeedDirection')!;
        if(this.selectedStation.toLowerCase() == "cwprs1"){
          for(let i in this.cwprs1 ){
            const [speedStr, directionStr] = this.cwprs1[i].Lower_CurrentSpeedDirection.split(';');
      
            // Convert the string parts to numbers
            const speed = parseFloat(speedStr);
            const direction = parseFloat(directionStr);
            this.sampleData3.push(
             {time: this.cwprs1[i].Date,       // Assuming 'Date' holds the time value
              speed: speed,     // Assuming 'speed' is available in 'cwprs1'
              direction: direction}
            );
          }
        }else if(this.selectedStation.toLowerCase() == "cwprs2"){
          for(let i in this.cwprs2 ){
            const [speedStr, directionStr] = this.cwprs2[i].Lower_CurrentSpeedDirection.split(';');
      
            // Convert the string parts to numbers
            const speed = parseFloat(speedStr);
            const direction = parseFloat(directionStr);
            this.sampleData3.push(
             {time: this.cwprs2[i].Date,       // Assuming 'Date' holds the time value
              speed: speed,     // Assuming 'speed' is available in 'cwprs1'
              direction: direction}
            );
          }
        }
        if (bottom) {
          const existingInstance = echarts.getInstanceByDom(bottom);
          if(existingInstance){
            existingInstance.dispose();
          }
          const bottomSpeedanddirection = echarts.init(bottom);
      
          // Prepare chart options
          const option = {
            title: {
              text: 'Bottom',  // Changed from 'Surface' to 'Low'
              left: '1%',
              textStyle: {
                color: '#1ee1ff',
                fontSize: 20
              }
            },
            tooltip: {
              trigger: 'axis',
            },
            grid: {
              left: '7%',
              right: '10%',
              bottom: '22%',
            },
            xAxis: {
              type: 'time',
              name: 'Time',
              nameLocation: 'middle',
              nameTextStyle: {
                color: '#1ee1ff',
                padding: [15, 0, 0, 0],
                fontSize: 16
              },
              axisLabel: {
                color: '#fff'
              },
              axisLine: {
                show: true
              },
              splitLine: {
                show: false
              }
            },
            yAxis: [
              ...(this.isSpeedChecked ? [{
                type: 'value',
                name: 'Current speed (m/s)',  // Left Y-axis title
                nameLocation: 'middle',
                nameTextStyle: {
                  color: '#1ee1ff',
                  padding: 35,
                  fontSize: 16,
                },
                axisLabel: {
                  color: '#fff',
                },
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: '#00bfff'  // Updated to blue
                  }
                },
                splitLine: {
                  show: true,
                  lineStyle: {
                    type: 'solid',
                    color: '#00bfff'  // Updated to blue
                  }
                }
              }] : []),
              
              ...(this.isCurrentChecked ? [{
                type: 'value',
                name: 'Current Direction (°)',
                nameLocation: 'middle',
                nameTextStyle: {
                  color: '#1ee1ff',
                  padding: 35,
                  fontSize: 16
                },
                axisLabel: {
                  color: '#fff',
                },
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: 'green'  // Updated to green
                  }
                },
                splitLine: {
                  show: true,
                  lineStyle: {
                    type: 'dashed',
                    color: 'green'  // Updated to green
                  }
                },
                position: this.isSpeedChecked && this.isCurrentChecked ? 'right' : '',
                min: 0,
                max: 360,
                interval: 90,
              }] : [])
            ],
            legend: {
              data: [
                ...(this.isSpeedChecked ? ['Current Speed (m/s)'] : []),
                ...(this.isCurrentChecked ? [ 'Current Direction (°)'] : []),
                ],
              orient: 'vertical',
              right: '10%',
              textStyle: {
                color: '#fff',
                fontSize: 14
              }
            },
            toolbox: {
              right: 10,
              feature: {
                dataZoom: { yAxisIndex: 'none' },
                restore: {},
                saveAsImage: {}
              },
              iconStyle: { borderColor: '#1ee1ff' }
            },
            dataZoom: [
              { type: 'slider', start: 0, end: 100 },
              { type: 'inside' }
            ],
            series: [
              ...(this.isSpeedChecked ? [{
                name: 'Current Speed (m/s)',
                data: this.sampleData3.map(item => [item.time, item.speed]),
                type: chartType,
                lineStyle: { normal: { color: '#00bfff' } },  // Updated to blue
                itemStyle: { color: '#00bfff' },  // Updated to blue
                showSymbol: false,
                label: { show: false, fontSize: 12 },
                yAxisIndex: 0
              }] : []),

              ...(this.isCurrentChecked ? [
                {
                  name: 'Current Direction (°)',
                  data: this.sampleData3.map(item => [item.time, item.direction]),
                  type: chartType,
                  lineStyle: { normal: { color: 'green', type: 'dashed' } },  // Updated to green
                  itemStyle: { color: 'green' },  // Updated to green
                  showSymbol: true,
                  label: { show: false, fontSize: 12 },
                  yAxisIndex: this.isSpeedChecked && this.isCurrentChecked ? 1 : 0
                }
              ] : [])              
            ]
          };
      
          // Set options for the chart
          bottomSpeedanddirection.setOption(option);
          this.loading = false;
          window.addEventListener('resize', () => {
            bottomSpeedanddirection.resize();
          });
        } else {
          console.error("Element with id 'bottomSpeedanddirection' not found");
          this.loading = false;
        }
      }



      polar(): void {
  this.loading = true;
  const polar = document.getElementById('rose-plot')!;
  this.sampleData4 = []; // Clear existing data if this function is called multiple times

  if (this.selectedStation.toLowerCase() === "cwprs1") {
    for (let i in this.cwprs1) {
      const [speedStr, directionStr] = this.cwprs1[i].Lower_CurrentSpeedDirection.split(';');
      const speed = parseFloat(speedStr);
      const direction = parseFloat(directionStr);
      this.sampleData4.push({
        time: this.cwprs1[i].Date,
        speed: speed,
        direction: direction
      });
    }
  } else if (this.selectedStation.toLowerCase() === "cwprs2") {
    for (let i in this.cwprs2) {
      const [speedStr, directionStr] = this.cwprs2[i].Lower_CurrentSpeedDirection.split(';');
      const speed = parseFloat(speedStr);
      const direction = parseFloat(directionStr);
      this.sampleData4.push({
        time: this.cwprs2[i].Date,
        speed: speed,
        direction: direction
      });
    }
  }

  if (polar) {
    const existingInstance = echarts.getInstanceByDom(polar);
    if (existingInstance) {
      existingInstance.dispose();
    }
    const bottomSpeedanddirection = echarts.init(polar);

    // Define color for each directional range
    const getColor = (direction: number) => {
      if (direction >= 0 && direction < 45) return '#FF5733';
      else if (direction >= 45 && direction < 90) return '#33FF57';
      else if (direction >= 90 && direction < 135) return '#3357FF';
      else if (direction >= 135 && direction < 180) return '#FF33A1';
      else if (direction >= 180 && direction < 225) return '#FF5733';
      else if (direction >= 225 && direction < 270) return '#33FF57';
      else if (direction >= 270 && direction < 315) return '#3357FF';
      else return '#FF33A1';
    };

    // Map data to be used in the chart
    const data = this.sampleData4.map(item => ({
      value: item.speed,
      itemStyle: { color: getColor(item.direction) }
    }));
    const angleData = this.sampleData4.map(item => item.direction);

    // Set up the chart options
    this.chartOption = {
      title: {
        text: 'Direction and Speed Analysis',
        subtext: 'Sample data visualization'
      },
      tooltip: {
        show: true,
        formatter: (params: { dataIndex: any; }) => {
          const { dataIndex } = params;
          const { direction, speed, time } = this.sampleData4[dataIndex];
          return `Direction: ${direction}°<br>Speed: ${speed} m/s<br>Date: ${time}`;
        }
      },
      angleAxis: {
        type: 'value',
        data: angleData,
        startAngle: 0
      },
      radiusAxis: {
        max: 2 // Adjust based on maximum speed value
      },
      polar: {},
      series: [
        {
          type: 'bar',
          data: data,
          coordinateSystem: 'polar',
          name: 'Speed',
          stack: 'speed'
        },
        {
          type: 'scatter',
          data: this.sampleData4.map(item => ({ value: [item.direction, item.speed], symbolSize: 10 })),
          coordinateSystem: 'polar',
          name: 'Current Direction',
          itemStyle: { color: 'red' }
        }
      ],
      legend: {
        show: true,
        right: '5%',
        data: [
             'Speed', 
           'Current Direction', 
            'Direction 0-45°', 
             'Direction 45-90°', 
             'Direction 90-135°', 
             'Direction 135-180°', 
             'Direction 180-225°', 
             'Direction 225-270°', 
             'Direction 270-315°', 
              'Direction 315-360°',
        ]
    }
    };

    // Set the option and handle resizing
    bottomSpeedanddirection.setOption(this.chartOption);
    this.loading = false;
    window.addEventListener('resize', () => {
      bottomSpeedanddirection.resize();
    });
  } else {
    console.error("Element with id 'polar' not found");
    this.loading = false;
  }
}

      
      // Helper function to determine color based on direction angle
      getColorByDirection(direction: number): string {
        if (direction >= 0 && direction < 45) {
          return '#FF5733'; // Color for 0-45 degrees
        } else if (direction >= 45 && direction < 90) {
          return '#33FF57'; // Color for 45-90 degrees
        } else if (direction >= 90 && direction < 135) {
          return '#3357FF'; // Color for 90-135 degrees
        } else if (direction >= 135 && direction < 180) {
          return '#FF33A1'; // Color for 135-180 degrees
        } else if (direction >= 180 && direction < 225) {
          return '#FF8C33'; // Color for 180-225 degrees
        } else if (direction >= 225 && direction < 270) {
          return '#33FFA8'; // Color for 225-270 degrees
        } else if (direction >= 270 && direction < 315) {
          return '#8C33FF'; // Color for 270-315 degrees
        } else if (direction >= 315 && direction <= 360) {
          return '#FF5733'; // Color for 315-360 degrees (loop back)
        } else {
          return '#FFFFFF'; // Default color if out of bounds
        }
      }
      
}    