import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateConcertDto } from './dto/create-concert.dto';
import { Concert, ReservationHistoryItem } from './types';

@Injectable()
export class ConcertsService {
  private concerts: Concert[] = [];
  private history: ReservationHistoryItem[] = [];

  getAllConcerts(): Array<Concert & { availableSeats: number; soldOut: boolean }> {
    return this.concerts.map((concert) => {
      const availableSeats = concert.totalSeats - concert.reservedByUserIds.length;
      return {
        ...concert,
        availableSeats,
        soldOut: availableSeats === 0
      };
    });
  }

  createConcert(payload: CreateConcertDto): Concert {
    const concert: Concert = {
      id: randomUUID(),
      name: payload.name.trim(),
      description: payload.description.trim(),
      totalSeats: payload.totalSeats,
      reservedByUserIds: [],
      createdAt: new Date().toISOString()
    };

    this.concerts.unshift(concert);
    this.logHistory('system', concert, 'create');

    return concert;
  }

  deleteConcert(concertId: string): void {
    const concert = this.findConcertOrThrow(concertId);
    this.concerts = this.concerts.filter((item) => item.id !== concertId);
    this.history = this.history.filter((entry) => entry.concertId !== concertId);
    this.logHistory('system', concert, 'delete');
  }

  reserveSeat(concertId: string, userId: string): void {
    if (!userId.trim()) {
      throw new BadRequestException('userId is required');
    }

    const concert = this.findConcertOrThrow(concertId);

    if (concert.reservedByUserIds.includes(userId)) {
      throw new ConflictException('You already reserved this concert');
    }

    if (concert.reservedByUserIds.length >= concert.totalSeats) {
      throw new ConflictException('No seats available for this concert');
    }

    concert.reservedByUserIds.push(userId);
    this.logHistory(userId, concert, 'reserve');
  }

  cancelReservation(concertId: string, userId: string): void {
    const concert = this.findConcertOrThrow(concertId);
    const existingIndex = concert.reservedByUserIds.indexOf(userId);

    if (existingIndex === -1) {
      throw new NotFoundException('Reservation not found for this user');
    }

    concert.reservedByUserIds.splice(existingIndex, 1);
    this.logHistory(userId, concert, 'cancel');
  }

  getAdminHistory(): ReservationHistoryItem[] {
    return [...this.history].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }

  getUserHistory(userId: string): ReservationHistoryItem[] {
    return this.getAdminHistory().filter((entry) => entry.userId === userId);
  }

  getDashboardMetrics() {
    const totalSeats = this.concerts.reduce((sum, concert) => sum + concert.totalSeats, 0);
    const reservedSeats = this.concerts.reduce(
      (sum, concert) => sum + concert.reservedByUserIds.length,
      0
    );

    return {
      totalSeats,
      reservedSeats,
      canceledCount: this.history.filter((entry) => entry.action === 'cancel').length
    };
  }

  private findConcertOrThrow(concertId: string): Concert {
    const concert = this.concerts.find((item) => item.id === concertId);
    if (!concert) {
      throw new NotFoundException('Concert not found');
    }
    return concert;
  }

  private logHistory(userId: string, concert: Concert, action: ReservationHistoryItem['action']) {
    this.history.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      concertId: concert.id,
      concertName: concert.name,
      action
    });
  }
}
