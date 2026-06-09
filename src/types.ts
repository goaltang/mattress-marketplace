export type MattressSize = "1.2m" | "1.5m" | "1.8m" | "King" | "Custom";
export type MattressMaterial = "Spring" | "Latex" | "Memory Foam" | "Hybrid";
export type MattressCondition = "Brand New" | "Like New" | "Very Good" | "Excellent" | "Good";
export type DeliveryType = "Pick-up Only" | "Delivery Available";

export interface MattressListing {
  id: string;
  title: string;
  brand: string;
  price: number;
  retailPrice?: number;
  size: MattressSize;
  dimensionsText: string;
  material: MattressMaterial;
  thicknessCm: number;
  useDuration: string;
  condition: MattressCondition;
  hygieneNote: string;
  hasElevator: boolean;
  deliveryOption: DeliveryType;
  description: string;
  city: string; // e.g. "Hangzhou" (杭州) or "Beijing" (北京)
  district: string; // e.g. "Binjiang", "Xihu", "Chaoyang"
  distanceKm?: number;
  images: string[];
  isVerifiedClean?: boolean;
  isHygieneVerified?: boolean;
  isCleaned?: boolean;
  hasWeChatID?: boolean;
  sellerDeviceId?: string;
  wechatId: string;
  phone?: string;
  createdAt: string;
  isActive?: boolean;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  type: "contact_request" | "insight" | "verification" | "completed";
  title: string;
  timestamp: string;
  message: string;
  detailUrl?: string;
  unread: boolean;
  actionState?: "pending" | "accepted" | "declined";
  buyerName?: string;
  listingTitle?: string;
  listingId?: string;
}

export type ActiveView = "browse" | "post" | "detail" | "favorites" | "messages";
