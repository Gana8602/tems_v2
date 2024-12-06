import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SensorService {
  private baseurl: String = 'http://192.168.0.101:3000/api/users/sensorData';
  http = Inject(HttpClient);

  sensors(): Observable<any> {
    return this.http.get(`${this.baseurl}`);
  }
}
