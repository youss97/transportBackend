import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentEntity,DocumentSchema } from '../schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentEntity.name, schema: DocumentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}