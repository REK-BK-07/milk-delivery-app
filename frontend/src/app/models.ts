export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  milkRatePerLiter: number;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  address: string;
  milkRatePerLiter: number;
}

export interface MilkEntryRequest {
  customerId: number;
  date: string;
  liters: number;
}

export interface MilkEntry {
  id: number;
  customerId: number;
  date: string;
  liters: number;
}

export interface MonthlyBill {
  customerId: number;
  year: number;
  month: number;
  totalLiters: number;
  ratePerLiter: number;
  totalBillAmount: number;
}
