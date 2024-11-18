import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, } from '@angular/common/http';

import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
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
  imports:[FormsModule, CommonModule, TableModule, MultiSelectModule, CalendarModule, DropdownModule ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  providers:[StationService]
})
export class ReportsComponent implements OnInit {

  searchQuery: string = '';

  selectedStation: string = 'CWPRS01';
  selectedPeriod: string = 'dateRange';
  periodOptions = [
    { label: 'Daily', value: 'dateRange' },
    { label: 'Weekly', value: 'weekRange' },
    { label: 'Monthly', value: 'monthRange' },
    { label: 'Yearly', value: 'yearRange' }
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

    CWPRS01: BuoyData[] = [];
    CWPRS02: BuoyData[] = [];

    loading: boolean = false;

    constructor(private stationService: StationService, private http:HttpClient, private cd: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.cols = [
        { field: 'S1_RelativeWaterLevel', header: 'Water Level' },
        { field: 'SurfaceSpeed', header: 'Surface Speed' },
        { field: 'SurfaceDirection', header: 'Surface Direction' },
        { field: 'MiddleSpeed', header: 'Mid Speed' },
        { field: 'MiddleDirection', header: 'Mid Direction' },
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

  // private formatToUTC(date: Date): string {
  //   const utcDate = new Date(date.getTime() - (5.5 * 60 * 60 * 1000));
  //   return utcDate.toISOString();
  // }

  private toISTISOString(date: Date): string {
    const offsetMilliseconds = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + offsetMilliseconds);
    istDate.setSeconds(0, 0);
    return istDate.toISOString().slice(0, -1); // Removing the 'Z' at the end
}

  fetchStations() {
    this.loading = true;
    let formattedFromDate: string | null = null;
    let formattedToDate: string | null = null;

        // Defaulting fromDate and toDate to current date at 00:00
        let fromDate = this.fromDate || new Date();
        let toDate = this.toDate || new Date();
    
        // Set both fromDate and toDate to midnight if not already set
        fromDate.setHours(0, 0, 0, 0); // Sets fromDate to 00:00:00 of the current date
  
    if (!this.selectedPeriod) {
      // One-day range (same date for from and to with time included)
      formattedFromDate = this.toISTISOString(fromDate);
      formattedToDate = this.toISTISOString(toDate);

      // formattedFromDate = this.fromDate.toISOString();
      // formattedToDate = this.toDate.toISOString();
    } else {
      // Format based on selected period
      switch (this.selectedPeriod) {
        case 'dateRange':
          formattedFromDate = this.fromDate ? this.toISTISOString(this.fromDate) : this.toISTISOString(fromDate);
          formattedToDate = this.toDate ? this.toISTISOString(this.toDate) : this.toISTISOString(toDate);
          break;
          // formattedFromDate = this.fromDate ? this.fromDate.toISOString() : null;
          // formattedToDate = this.toDate ? this.toDate.toISOString() : null;  
          // break;
  
        case 'weekRange':
          if (this.selectedWeek) {
            // Create a new Date object based on selectedWeek and set hours to 00:00:00
            const startOfWeek = new Date(this.selectedWeek);
            startOfWeek.setHours(0, 0, 0, 0);
            formattedFromDate = this.toISTISOString(startOfWeek);

            // Get the week end date and set it to 23:59:59
            const weekEndDate = this.getWeekEndDate(this.selectedWeek);
            formattedToDate = this.toISTISOString(weekEndDate);
          } else {
            formattedFromDate = null;
            formattedToDate = null;
          }
          break;
  
        case 'monthRange':
          formattedFromDate = this.selectedMonth ? 
            `${this.selectedMonth.getFullYear()}-${(this.selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01T00:00:00` : 
            null;
          const monthEndDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
          formattedToDate = monthEndDate ? `${monthEndDate.toISOString().split('T')[0]}T23:59:59` : null;
          break;
  
        case 'yearRange':
          const year = this.selectedYear.getFullYear();
          formattedFromDate = `${year}-01-01T00:00:00`;
          formattedToDate = `${year}-12-31T23:59:59`;
          break;
  
        default:
          // Handle invalid or no period selected
          break;
      }
    }
  
   
    this.stationService.getStations(formattedFromDate!, formattedToDate!).subscribe(
      (data: buoys) => {
         this.CWPRS01 = data.buoy1.map(buoy => ({
          ...buoy,
          SurfaceSpeed: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[0],
          SurfaceDirection: buoy.S2_SurfaceCurrentSpeedDirection?.split(';')[1],
          MiddleSpeed: buoy.Middle_CurrentSpeedDirection?.split(';')[0],
          MiddleDirection: buoy.Middle_CurrentSpeedDirection?.split(';')[1],
          LowerSpeed: buoy.Lower_CurrentSpeedDirection?.split(';')[0],
          LowerDirection: buoy.Lower_CurrentSpeedDirection?.split(';')[1],
        }));
        this.CWPRS02 = data.buoy2.map(buoy => ({
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
 }

getWeekEndDate(startDate: Date): Date {
  let endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);  // Add 6 days to get the week end
  endDate.setHours(23, 59, 59, 999);
  return endDate;
}

toggleSearch() {
  const searchIcon = document.querySelector('.search-icon');
  searchIcon?.classList.toggle('open');
} 

highlightSearchText(value: any): string {
  if (!this.searchQuery) return value;

  // Ensure the value is treated as a string
  const stringValue = value !== null && value !== undefined ? String(value) : '';
  const escapedSearchQuery = this.searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchQuery})`, 'gi');
  return stringValue.replace(regex, '<span class="highlight">$1</span>');
}

onSearch(query: string, dt2: any): void {
  this.searchQuery = query;
  dt2.filterGlobal(query, 'contains');
}


  selectStationoption(type: string) {
  this.selectedStation = type;
  
  if(this.selectedStation == 'CWPRS01'){
   }else if(this.selectedStation == 'CWPRS02'){
   }
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
  // Define fixed headers and fields to always include
  const fixedHeaders = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
  const fixedFields = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
 
  // Get dynamic headers and fields from selected columns
  const dynamicHeaders = this.selectedColumns.map(col => col.header);
  const dynamicFields = this.selectedColumns.map(col => col.field);
 
  // Combine fixed and dynamic headers and fields
  const headers = [...fixedHeaders, ...dynamicHeaders];
  const fields = [...fixedFields, ...dynamicFields];
 
  // Build CSV rows with combined headers and fields
  const csvRows = [
      headers.join(','), // First row with combined headers
      ...data.map(row => fields.map(field => `"${row[field] || ''}"`).join(',')) // Include values for combined fields in each row
  ];
 
  return csvRows.join('\r\n');
}
 
 
 
 
 
 
exportExcel(dt2: any) {
  const filteredData =  dt2.value;
 
  if (filteredData && filteredData.length > 0) {
      // Define fixed headers and fields to always include
      const fixedHeaders = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
      const fixedFields = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
 
      // Get dynamic headers and fields from selected columns
      const dynamicHeaders = this.selectedColumns.map(col => col.header);
      const dynamicFields = this.selectedColumns.map(col => col.field);
 
      // Combine fixed and dynamic headers and fields
      const headers = [...fixedHeaders, ...dynamicHeaders];
      const fields = [...fixedFields, ...dynamicFields];
 
      // Map filteredData to include both fixed and dynamic fields
      const dataToExport = filteredData.map((row: any) => {
          const selectedRow: any = {};
 
          // Populate fixed fields first
          fixedFields.forEach(field => {
              selectedRow[field] = row[field];
          });
 
          // Populate dynamic fields
          dynamicFields.forEach(field => {
              selectedRow[field] = row[field];
          });
 
          return selectedRow;
      });
 
      // Create the worksheet with combined headers
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport, {  });
      const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
 
      this.saveAsExcelFile(excelBuffer, 'buoy_data');
  } else {
      console.warn('No data available for Excel export');
  }
}
 
saveAsExcelFile(buffer: any, fileName: string): void {
  const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
  saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
}
 
 
 
 
exportPDF(dt2: any) {
  const filteredData: BuoyData[] = dt2.value;
 
  if (filteredData && filteredData.length > 0) {
      // Define fixed headers and fields to always include
      const fixedHeaders = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
      const fixedFields = ['StationID', 'DateTime', 'UTC_Time', 'LAT', 'LONG', 'Battery_Voltage', 'GPS_Date'];
 
      // Get dynamic headers and fields from selected columns
      const dynamicHeaders = this.selectedColumns.map(col => col.header);
      const dynamicFields = this.selectedColumns.map(col => col.field);
 
      // Combine fixed and dynamic headers and fields
      const headers = [...fixedHeaders, ...dynamicHeaders];
      const fields = [...fixedFields, ...dynamicFields];
 
      // Create a PDF with landscape orientation
      const doc = new jsPDF('landscape');
 
      // Set document properties
      doc.setFontSize(12);
      doc.text(this.selectedStation, 14, 16);
 
      // Prepare headers for the table
      const headerObjects = headers.map(header => ({ title: header, dataKey: header }));
 
      // Map data to include both fixed and dynamic fields
      const data = filteredData.map((row: any) => {
          return fields.map(field => row[field] || ''); // Handle undefined or null values gracefully
      });
 
      // Add table to PDF with fixed and dynamic fields
      (doc as any).autoTable({
          head: [headerObjects.map(h => h.title)], // Headers row
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










