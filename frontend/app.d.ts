export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedByUserIds: string[];
  availableSeats: number;
  soldOut: boolean;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  userId: string;
  concertId: string;
  concertName: string;
  action: 'reserve' | 'cancel' | 'create' | 'delete';
}
