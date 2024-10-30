import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Config, SensorData, sensorLiveData, StationConfigs } from '../model/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {

  private apiUrl = 'http://localhost:3000/api/';
  constructor(private http: HttpClient) { }
  getStationNames(): Observable<StationConfigs[]> {
    return this.http.get<StationConfigs[]>(`${this.apiUrl}getstationconfig`); // Adjust the endpoint
  }

  // http://localhost:3000/api/getconfigs
  getsensorConfigs():Observable<Config[]>{
    return this.http.get<Config[]>(`${this.apiUrl}getconfigs`);
  }
  
  getSensorLiveData(fromDate:string, toDate:string): Observable<sensorLiveData>{
    const params=  new HttpParams()
  .set('fromDate', fromDate)
  .set('toDate', toDate)
    return this.http.get<sensorLiveData>(`${this.apiUrl}users/sensorData`, {params});
  }
}
