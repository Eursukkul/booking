import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConcertsService } from './concerts.service';

describe('ConcertsService', () => {
  let service: ConcertsService;

  beforeEach(() => {
    service = new ConcertsService();
  });

  it('creates and lists concerts', () => {
    service.createConcert({
      name: 'The Weekend 2026',
      description: 'Live in Bangkok',
      totalSeats: 100
    });

    const concerts = service.getAllConcerts();
    expect(concerts).toHaveLength(1);
    expect(concerts[0].availableSeats).toBe(100);
  });

  it('reserves and cancels seat', () => {
    const concert = service.createConcert({
      name: 'Coldplay',
      description: 'One night only',
      totalSeats: 1
    });

    service.reserveSeat(concert.id, 'user-1');
    expect(service.getAllConcerts()[0].availableSeats).toBe(0);

    service.cancelReservation(concert.id, 'user-1');
    expect(service.getAllConcerts()[0].availableSeats).toBe(1);
  });

  it('prevents duplicate reservation', () => {
    const concert = service.createConcert({
      name: 'Bruno Mars',
      description: 'Arena show',
      totalSeats: 2
    });

    service.reserveSeat(concert.id, 'user-1');

    expect(() => service.reserveSeat(concert.id, 'user-1')).toThrow(ConflictException);
  });

  it('throws when sold out', () => {
    const concert = service.createConcert({
      name: 'Adele',
      description: 'World tour',
      totalSeats: 1
    });

    service.reserveSeat(concert.id, 'user-1');

    expect(() => service.reserveSeat(concert.id, 'user-2')).toThrow(ConflictException);
  });

  it('throws when cancelling non-existing reservation', () => {
    const concert = service.createConcert({
      name: 'Imagine Dragons',
      description: 'Tour stop',
      totalSeats: 100
    });

    expect(() => service.cancelReservation(concert.id, 'user-1')).toThrow(NotFoundException);
  });

  it('deletes concert', () => {
    const concert = service.createConcert({
      name: 'Muse',
      description: 'Rock night',
      totalSeats: 50
    });

    service.deleteConcert(concert.id);
    expect(service.getAllConcerts()).toHaveLength(0);
  });
});
