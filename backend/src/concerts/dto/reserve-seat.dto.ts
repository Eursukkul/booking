import { IsNotEmpty, IsString } from 'class-validator';

export class ReserveSeatDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
