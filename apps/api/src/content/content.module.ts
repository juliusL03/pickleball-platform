import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './schemas/content.schema';
import { ContentService } from './content.service';
import { ContentResolver } from './content.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
  providers: [ContentService, ContentResolver],
  exports: [ContentService],
})
export class ContentModule {}
