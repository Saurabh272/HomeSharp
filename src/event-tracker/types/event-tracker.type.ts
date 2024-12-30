export interface UserInfo {
  userId?: string;
  ipAddress?: string;
  domain?: string;
  pagePath?: string;
  userAgent?: string;
  referrerUrl?: string;
  deviceInfo?: object;
}

export interface Params {
  card_mode?: string;
  card_position?: string;
  page_name?: string;
  page_type?: string;
  property_id?: string;
  property_name?: string;
  tray_id?: string;
  tray_name?: string;
  tray_position?: string;
  tray_type?: string;
  userInfo?: UserInfo;
  userId?: string;
  externalId?: string;
  engagement_time_msec?: number;
  referrerUrl?: string;
}

export interface Event {
  event_id?: string;
  timestamp?: string;
  event_name: string;
  params?: Params;
}

export interface RequestDetails {
  userAgent: string | null;
  ipAddress: string | null;
  referrerUrl: string | null;
  userId: string | null;
  externalId: string | null;
  browser: string | null;
  device_category: string | null;
  device_brand: string | null;
  device_model: string | null;
  os_with_version: string | null;
  operating_system: string | null;
  platform: string | null;
  city: string | null;
  country: string | null;
  app_version: string | null;
}
