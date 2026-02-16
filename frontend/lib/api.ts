import type { Concert, HistoryItem } from '../app.d';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export function getConcerts() {
  return request<Concert[]>('/concerts');
}

export function getMetrics() {
  return request<{ totalSeats: number; reservedSeats: number; canceledCount: number }>('/concerts/metrics');
}

export function createConcert(payload: {
  name: string;
  description: string;
  totalSeats: number;
}) {
  return request<Concert>('/concerts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function deleteConcert(concertId: string) {
  return request<{ success: boolean }>(`/concerts/${concertId}`, {
    method: 'DELETE'
  });
}

export function reserveSeat(concertId: string, userId: string) {
  return request<{ success: boolean }>(`/concerts/${concertId}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function cancelSeat(concertId: string, userId: string) {
  return request<{ success: boolean }>(`/concerts/${concertId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

export function getHistory(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return request<HistoryItem[]>(`/concerts/history${query}`);
}
