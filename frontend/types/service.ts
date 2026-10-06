export interface Service {
  id: number;
  name: string;
  category: string;
  unit_price: string; // server sends decimal as string
  description: string | null;
  is_available: 0 | 1;
  created_at: string;
  updated_at: string;
}

// GET /api/services returns this
export interface ServiceListResponse {
  services: Service[];
  grouped: Record<string, Service[]>;
}

export interface ServiceCreatePayload {
  name: string;
  category: string;
  unit_price: number;
  description?: string;
  is_available?: 0 | 1;
}

export interface ServiceUpdatePayload {
  name?: string;
  category?: string;
  unit_price?: number;
  description?: string;
  is_available?: 0 | 1;
}
