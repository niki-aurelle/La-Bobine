// ─── Utilisateur ────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  atelierName?: string;
  avatarUrl?: string;
  currency: string;
  language: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

// ─── Cliente ─────────────────────────────────────────────────────────────────
export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  avatarUrl?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
}

// ─── Mesures ─────────────────────────────────────────────────────────────────
export interface Measurement {
  _id: string;
  client: string;
  label: string;
  unit: 'cm' | 'in';
  bustCircumference?: number;
  underBust?: number;
  shoulderWidth?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  backLength?: number;
  armLength?: number;
  armCircumference?: number;
  wristCircumference?: number;
  inseamLength?: number;
  thighCircumference?: number;
  totalHeight?: number;
  frontLength?: number;
  skirtLength?: number;
  customMeasurements?: Array<{ name: string; value: number; unit: string }>;
  notes?: string;
  createdAt: string;
}

// ─── Commande ─────────────────────────────────────────────────────────────────
export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'fitting' | 'ready' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Order {
  _id: string;
  reference: string;
  client: Client;
  garmentType: string;
  description?: string;
  fabric?: string;
  fabricQuantity?: number;
  modelPhotoUrl?: string;
  totalPrice: number;
  depositAmount: number;
  status: OrderStatus;
  priority: OrderPriority;
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  internalNotes?: string;
  payments?: Payment[];
  fittings?: Fitting[];
  balance?: { totalPrice: number; totalPaid: number; remaining: number };
  createdAt: string;
}

// ─── Paiement ─────────────────────────────────────────────────────────────────
export type PaymentType = 'deposit' | 'partial' | 'balance' | 'full';
export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer' | 'card' | 'other';

export interface Payment {
  _id: string;
  order: string;
  client: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
  reference?: string;
}

// ─── Essayage ─────────────────────────────────────────────────────────────────
export interface Fitting {
  _id: string;
  order: string;
  client: string;
  scheduledAt: string;
  completedAt?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  adjustments?: string;
  notes?: string;
  fittingNumber: number;
}

// ─── Rendez-vous ─────────────────────────────────────────────────────────────
export type AppointmentType = 'fitting' | 'delivery' | 'consultation' | 'pickup' | 'other';

export interface Appointment {
  _id: string;
  client?: Client;
  order?: Pick<Order, '_id' | 'reference' | 'garmentType'>;
  title: string;
  type: AppointmentType;
  startAt: string;
  endAt?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// ─── Livraison ────────────────────────────────────────────────────────────────
export interface Delivery {
  _id: string;
  order: Pick<Order, '_id' | 'reference' | 'garmentType'>;
  client: Pick<Client, '_id' | 'firstName' | 'lastName' | 'phone'>;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'delivered' | 'late' | 'cancelled';
  deliveryAddress?: string;
  notes?: string;
}

// ─── Photo ────────────────────────────────────────────────────────────────────
export interface Photo {
  _id: string;
  order?: string;
  client?: string;
  originalUrl: string;
  thumbnailUrl?: string;
  filename: string;
  caption?: string;
  tags?: string[];
  isPortfolio: boolean;
  aiEnhanced: boolean;
  aiJobId?: string;
  createdAt: string;
}

// ─── Job IA ───────────────────────────────────────────────────────────────────
export type AIJobStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface AIJob {
  _id: string;
  status: AIJobStatus;
  inputUrl: string;
  outputUrl?: string;
  errorMessage?: string;
  processingMs?: number;
  createdAt: string;
  completedAt?: string;
}

// ─── Stock ────────────────────────────────────────────────────────────────────
export type InventoryCategory = 'fabric' | 'thread' | 'button' | 'zipper' | 'accessory' | 'other';

export interface InventoryItem {
  _id: string;
  name: string;
  category: InventoryCategory;
  color?: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  unitPrice?: number;
  supplierName?: string;
  isLow: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  stats: {
    totalClients: number;
    ordersInProgress: number;
    ordersLate: number;
    pendingDeliveries: number;
    monthRevenue: number;
    monthPaymentCount: number;
  };
  upcomingAppointments: Appointment[];
  recentOrders: Order[];
}

// ─── API Générique ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; limit: number };
}
