import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, } from '@angular/common/http';

import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { StationService, buoys, BuoyData} from '../station_service/station.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';

import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface Column {
    field: string;
    header: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports:[FormsModule, CommonModule, TableModule, MultiSelectModule, Button, CalendarModule, DropdownModule ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers:[StationService]
})
export class ReportsComponent implements OnInit {
 
  selectedStation: string = 'cwprs1';
  selectedPeriod: string = 'dateRange';
  periodOptions = [
    { label: 'Date Range', value: 'dateRange' },
    { label: 'Week Range', value: 'weekRange' },
    { label: 'Month Range', value: 'monthRange' },
    { label: 'Year Range', value: 'yearRange' }
];

exportOptions = [
  { label: 'Export to CSV', value: 'csv' },
  { label: 'Export to Excel', value: 'excel' },
  { label: 'Export to PDF', value: 'pdf' }
];

    cols: Column[] = [];
    selectedColumns: Column[] = [];

    fromDate =new Date();
    toDate = new Date();
    selectedWeek =new Date();
    selectedMonth =new Date();
    selectedYear =new Date();

    cwprs1: BuoyData[] = [];
    cwprs2: BuoyData[] = [];

    loading: boolean = false;

    constructor(private stationService: StationService, private http:HttpClient, private cd: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.cols = [
        { field: 'S1_RelativeWaterLevel', header: 'Water Level' },
        { field: 'SurfaceSpeed', header: 'Surface Speed' },
        { field: 'SurfaceDirection', header: 'Surface Direction' },
        { field: 'MiddleSpeed', header: 'Middle Speed' },
        { field: 'MiddleDirection', header: 'Middle Direction' },
        { field: 'LowerSpeed', header: 'Bottom Speed' },
        { field: 'LowerDirection', header: 'Bottom Direction' }
    ];

    this.selectedColumns = this.cols; 

      this.fetchStations();
  }

  onExportOptionSelect(event: any, dt2: any) {
    const selectedOption = event.value;
    switch (selectedOption) {
      case 'csv':
        this.exportCSV(dt2);
        break;
      case 'excel':
        this.exportExcel(dt2);
        break;
      case 'pdf':
        this.exportPDF(dt2);
        break;
      default:
        break;
    }
  }


fetchStations() {
  this.loading = true;
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
            // Extract the year from the Date object and format the year range
            const year = this.selectedYear.getFullYear(); // Extracting just the year part
            formattedFromDate = `${year}-01-01`;
            formattedToDate = `${year}-12-31`;   // Last day of the year
      break;

    default:
      // Handle invalid period or no period selected
      break;
  }
}

  console.log(`Formatted From Date: ${formattedFromDate}, Formatted To Date: ${formattedToDate}`);


  this.stationService.getStations("2024-01-01", formattedToDate!).subscribe(
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
    },
    error => {
      console.error('Error fetching buoy data', error);
      this.loading = false;
    }
  );
}

  onPeriodChange(event: any) {
    // this.selectedPeriod = event.target.value
  console.log('Selected Period:', event.value);
}

getWeekEndDate(startDate: Date): Date {
  let endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);  // Add 6 days to get the week end
  return endDate;
}

toggleSearch() {
  const searchIcon = document.querySelector('.search-icon');
  searchIcon?.classList.toggle('open');
} 


  selectStationoption(type: string) {
  this.selectedStation = type;
  
  if(this.selectedStation == 'cwprs1'){
    console.log(this.cwprs1); 
  }else if(this.selectedStation == 'cwprs2'){
    console.log(this.cwprs1);
  }
  console.log(`selectedType : ${this.selectedStation}`);
  }
    
  exportCSV(dt2: any) {
    const filteredData = dt2.filteredValue || dt2.value;

    if (filteredData && filteredData.length > 0) {
        const csv = this.convertToCSV(filteredData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        FileSaver.saveAs(blob, 'buoy_data.csv');
    } else {
        // Handle case where no data is available
        console.warn('No data available for CSV export');
    }
}

// Helper method to convert JSON to CSV format
convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Join headers
        ...data.map(row => headers.map(field => `"${row[field]}"`).join(',')) // Map each row's fields and join
    ];
    return csvRows.join('\r\n');
}


  exportExcel(dt2: any) {
    const filteredData = dt2.filteredValue || dt2.value;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    this.saveAsExcelFile(excelBuffer, 'buoy_data');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }

  exportPDF(dt2: any) {
    const filteredData: BuoyData[] = dt2.filteredValue || dt2.value;

    if (filteredData && filteredData.length > 0) {
        // Create a PDF with landscape orientation
        const doc = new jsPDF('landscape');

        // Set document properties
        doc.setFontSize(12);
        doc.text(this.selectedStation, 14, 16);

        // Get table headers
        const headers = Object.keys(filteredData[0]).map(key => ({ title: key, dataKey: key }));

        // Convert data to table format
        const data = filteredData.map((row: BuoyData) => {
            return headers.map(header => row[header.dataKey as keyof BuoyData]);
        });

        // Add table to PDF
        (doc as any).autoTable({
            head: [headers.map(h => h.title)], // Headers row
            body: data, // Body of the table
            startY: 22, // Start position after the title
            margin: { top: 20 }, // Adjust top margin
            styles: { fontSize: 8 }, // Adjust font size to fit more data
        });

        // Save the PDF in landscape mode
        doc.save('buoy_data.pdf');
    } else {
        // Handle case where no data is available
        console.warn('No data available for PDF export');
    }
}
}
