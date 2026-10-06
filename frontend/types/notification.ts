export type NotificationChannel = 'email' | 'sms' | 'in_app';

export interface Notification {
  id: number;
  user_id: number;
  order_id: number | null;
  channel: NotificationChannel;
  title: string;
  message: string;
  is_read: 0 | 1;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread: number;
}
