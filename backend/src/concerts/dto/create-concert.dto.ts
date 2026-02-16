import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  @Max(50000)
  totalSeats!: number;
}
