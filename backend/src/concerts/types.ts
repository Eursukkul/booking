export type HistoryAction = 'reserve' | 'cancel' | 'create' | 'delete';

export interface ReservationHistoryItem {
  id: string;
  timestamp: string;
  userId: string;
  concertId: string;
  concertName: string;
  action: HistoryAction;
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedByUserIds: string[];
  createdAt: string;
}
