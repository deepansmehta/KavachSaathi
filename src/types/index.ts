export type PlanType = 'standard' | 'pro' | 'guest';

export type MealRelation = 'before' | 'after' | 'with' | 'any';

export type MedicineTiming = 'morning' | 'afternoon' | 'evening' | 'night';

export type HealthLogType = 'bp' | 'sugar' | 'weight';

export type NotifType =
  | 'medicine_reminder'
  | 'card_scanned'
  | 'medicine_refill'
  | 'plan_expiry_warning'
  | 'sos_sent'
  | 'remote_announcement';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  plan: PlanType;
  planExpiry?: number;
  healthId: string;
  fcmToken?: string;
  createdAt: number;
  lastSeen: number;
  biometricEnabled?: boolean;
  isBloodDonor?: boolean;
  onboardingComplete?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dob?: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact1?: EmergencyContact;
  emergencyContact2?: EmergencyContact;
  insuranceId?: string;
  abhaNumber?: string;
  pmjayId?: string;
  organDonor: boolean;
  isBloodDonor: boolean;
  cardType: 'standard' | 'pro';
  qrToken: string;
  nfcId?: string;
  cardActivated: boolean;
  photoURL?: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency?: string;
  timing: MedicineTiming[];
  mealRelation: MealRelation;
  startDate: number;
  endDate?: number;
  active: boolean;
  prescriptionId?: string;
  stockCount?: number;
  refillReminderDays?: number;
  takenToday?: Partial<Record<MedicineTiming, boolean>>;
}

export interface Prescription {
  id: string;
  imageUrl: string;
  medicines: Medicine[];
  date: number;
  doctorName?: string;
  verified: boolean;
}

export interface HealthLog {
  id: string;
  type: HealthLogType;
  value: number;
  unit: string;
  timestamp: number;
  notes?: string;
}

export interface CardScan {
  id: string;
  qrToken: string;
  scannedAt: number;
  userId: string;
  memberId: string;
  location?: { lat: number; lng: number };
  placeName?: string;
}

export interface ExtractedMedicine {
  name: string;
  dosage: string;
  timing: MedicineTiming[];
  mealRelation: MealRelation;
  confidence: 'high' | 'low';
  rawText?: string;
}

export interface HomeBannerConfig {
  visible: boolean;
  title: string;
  subtitle: string;
  color: string;
  actionUrl: string;
  icon: string;
}

export interface OfferConfig {
  visible: boolean;
  title: string;
  discount: number;
  code: string;
  expiry: string;
}

export interface NewFeatureConfig {
  visible: boolean;
  title: string;
  description: string;
  screen: string;
}

export interface MaintenanceConfig {
  active: boolean;
  message: string;
}

export interface RemoteConfigState {
  homeBanner: HomeBannerConfig;
  offer: OfferConfig;
  newFeature: NewFeatureConfig;
  maintenance: MaintenanceConfig;
  forceUpdate: boolean;
  minAppVersion: string;
  tipOfDay: string;
  thalsaathiCampaign: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'scan' | 'prescription' | 'medicine' | 'sos';
  title: string;
  subtitle: string;
  timestamp: number;
}

export type PhysicalCardStatus = 'ready' | 'shipped' | 'active' | 'blocked';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';
export type DigitalCardStatus = 'digital_only' | 'physical_pending' | 'fully_active';

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InventoryCard {
  cardId: string;
  type: 'standard' | 'pro';
  status: PhysicalCardStatus;
  assignedTo: string | null;
  orderId: string | null;
  activatedAt: number | null;
  memberLinked: string | null;
  qrToken: string;
  createdAt: number;
}

export interface CardOrder {
  orderId: string;
  userId: string;
  cardType: 'standard' | 'pro';
  amount: number;
  status: OrderStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  shippingAddress: ShippingAddress;
  digitalCardId: string | null;
  trackingNumber: string | null;
  createdAt: number;
  paidAt: number | null;
  shippedAt: number | null;
}

export interface DigitalCard {
  cardId: string;
  type: 'standard' | 'pro';
  status: DigitalCardStatus;
  qrToken: string;
  orderId: string;
  activatedAt: number | null;
  memberLinked: string | null;
}
