export interface Channel {
  id: string;
  code: string;
  name: string;
  type: ChannelType;
  platform?: string;
  status: ChannelStatus;
  config?: ChannelConfig;
  createdAt: string;
  updatedAt: string;
}

export enum ChannelType {
  MINI_PROGRAM = 'mini_program',
  APP = 'app',
  WEBSITE = 'website',
  OFFLINE = 'offline',
}

export enum ChannelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
}

export interface ChannelConfig {
  theme?: string;
  features?: string[];
  restrictions?: Record<string, any>;
}

export interface ChannelOverride {
  id: string;
  productId: string;
  channelId: string;
  channel: Channel;
  shortTitle?: string;
  shortDescription?: string;
  customImages?: any[];
  customAttributes?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
