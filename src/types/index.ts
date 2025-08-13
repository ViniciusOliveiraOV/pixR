export interface BoletoInfo {
  id: string;
  barcode: string;
  amount: number;
  dueDate: Date;
  beneficiary: string;
  description?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PixPayment {
  id: string;
  pixKey: string;
  amount: number;
  description?: string;
  recipientName?: string;
  status: PaymentStatus;
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface BankConnection {
  isConnected: boolean;
  lastConnectionTest: Date;
  errorMessage?: string;
}

export interface NubankCredentials {
  cpf: string;
  password: string;
  certPath?: string;
  certPassword?: string;
}
