import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerRequest, MilkEntry, MilkEntryRequest, MonthlyBill } from './models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  createCustomer(request: CustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, request);
  }

  createMilkEntry(request: MilkEntryRequest): Observable<MilkEntry> {
    return this.http.post<MilkEntry>(`${this.apiUrl}/milk-entries`, request);
  }

  getMonthlyBill(customerId: number, year: number, month: number): Observable<MonthlyBill> {
    const params = new HttpParams()
      .set('customerId', customerId)
      .set('year', year)
      .set('month', month);
    return this.http.get<MonthlyBill>(`${this.apiUrl}/billing/monthly`, { params });
  }
}
