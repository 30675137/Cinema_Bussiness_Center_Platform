export interface Store {
  id: string;
  code: string;
  name: string;
  type: StoreType;
  address: StoreAddress;
  contact: StoreContact;
  businessHours: BusinessHours;
  status: StoreStatus;
  location?: GeoLocation;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export enum StoreType {
  CINEMA = 'cinema',
  THEATER = 'theater',
  CONCERT_HALL = 'concert_hall',
  MIXED = 'mixed',
}

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface StoreAddress {
  province: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  postalCode?: string;
}

export interface StoreContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface BusinessHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  holidays?: HolidaySchedule[];
}

export interface DaySchedule {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface HolidaySchedule {
  date: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
