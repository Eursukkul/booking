import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CreateConcertDto } from './dto/create-concert.dto';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import { ConcertsService } from './concerts.service';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  getConcerts() {
    return this.concertsService.getAllConcerts();
  }

  @Get('metrics')
  getMetrics() {
    return this.concertsService.getDashboardMetrics();
  }

  @Get('history')
  getHistory(@Query('userId') userId?: string) {
    if (!userId) {
      return this.concertsService.getAdminHistory();
    }

    return this.concertsService.getUserHistory(userId);
  }

  @Post()
  createConcert(@Body() body: CreateConcertDto) {
    return this.concertsService.createConcert(body);
  }

  @Delete(':concertId')
  deleteConcert(@Param('concertId') concertId: string) {
    this.concertsService.deleteConcert(concertId);
    return { success: true };
  }

  @Post(':concertId/reserve')
  reserveSeat(@Param('concertId') concertId: string, @Body() body: ReserveSeatDto) {
    this.concertsService.reserveSeat(concertId, body.userId);
    return { success: true };
  }

  @Post(':concertId/cancel')
  cancelSeat(@Param('concertId') concertId: string, @Body() body: ReserveSeatDto) {
    this.concertsService.cancelReservation(concertId, body.userId);
    return { success: true };
  }
}
