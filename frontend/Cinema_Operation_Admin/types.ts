export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCENARIOS = 'SCENARIOS',
  SCHEDULE = 'SCHEDULE',
  ORDERS = 'ORDERS',
  VERIFICATION = 'VERIFICATION',
  PRODUCT_BOM = 'PRODUCT_BOM',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE'
}

export interface NavItem {
  id: ViewState;
  label: string;
  icon: any;
}

export enum Status {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Completed = 'Completed',
  Warning = 'Warning',
  Error = 'Error'
}
