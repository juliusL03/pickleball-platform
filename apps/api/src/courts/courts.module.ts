import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Court, CourtSchema } from './schemas/court.schema';
import { CourtsService } from './courts.service';
import { CourtsResolver } from './courts.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Court.name, schema: CourtSchema }]),
  ],
  providers: [CourtsService, CourtsResolver],
  exports: [CourtsService],
})
export class CourtsModule {}
