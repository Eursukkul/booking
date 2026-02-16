import { Module } from '@nestjs/common';
import { ConcertsModule } from './concerts/concerts.module';

@Module({
  imports: [ConcertsModule]
})
export class AppModule {}
