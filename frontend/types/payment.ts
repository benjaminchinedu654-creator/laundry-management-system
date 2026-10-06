export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentState = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentState;
  reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;

  // Populated by admin list endpoint
  user_name?: string;
  order_code?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  totals: {
    all_time: number;
    today: number;
  };
}

export interface PaymentCreatePayload {
  order_id: number;
  amount: number;
  method: PaymentMethod;
  status?: PaymentState;
  reference?: string;
  paid_at?: string;
}
