
export enum ViewState {
  HOME = 'HOME',
  DETAIL = 'DETAIL',
  SUCCESS = 'SUCCESS',
  ADMIN = 'ADMIN'
}

export type ScenarioCategory = 'MOVIE' | 'TEAM' | 'PARTY';

export interface ScenarioPackage {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  desc: string;
  tags: string[];
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  category: 'Food' | 'Drink' | 'Service';
}

export interface Scenario {
  id: string;
  title: string;
  image: string;
  category: ScenarioCategory;
  tags: string[]; // e.g. "2-4 People", "120 Mins"
  location: string;
  rating: number;
  packages: ScenarioPackage[];
}

export interface BookingState {
  scenarioId: string | null;
  packageId: string | null;
  date: string;
  timeSlot: string;
  addons: Record<string, number>; // addonId -> quantity
}

export interface AdminOrder {
  id: string;
  customer: string;
  scenarioTitle: string;
  time: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
