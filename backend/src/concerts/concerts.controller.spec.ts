import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';

describe('ConcertsController', () => {
  let controller: ConcertsController;
  let service: ConcertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [ConcertsService]
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
    service = module.get<ConcertsService>(ConcertsService);
  });

  it('creates concert through controller', () => {
    const result = controller.createConcert({
      name: 'Arctic Monkeys',
      description: 'Live show',
      totalSeats: 400
    });

    expect(result.name).toBe('Arctic Monkeys');
    expect(service.getAllConcerts()).toHaveLength(1);
  });

  it('reserves and cancels through controller', () => {
    const concert = controller.createConcert({
      name: 'Maroon 5',
      description: 'Stadium',
      totalSeats: 1
    });

    controller.reserveSeat(concert.id, { userId: 'user-1' });
    expect(service.getAllConcerts()[0].availableSeats).toBe(0);

    controller.cancelSeat(concert.id, { userId: 'user-1' });
    expect(service.getAllConcerts()[0].availableSeats).toBe(1);
  });

  it('deletes concert through controller', () => {
    const concert = controller.createConcert({
      name: 'Sia',
      description: 'One night',
      totalSeats: 50
    });

    controller.deleteConcert(concert.id);
    expect(service.getAllConcerts()).toHaveLength(0);
  });
});
