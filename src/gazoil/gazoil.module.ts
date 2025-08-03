// src/gazoil/gazoil.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GazoilService } from './gazoil.service';
import { GazoilController } from './gazoil.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Gazoil, GazoilSchema } from 'src/schemas/gazoil.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Gazoil.name, schema: GazoilSchema }])],
  controllers: [GazoilController],
  providers: [GazoilService, CloudinaryService],
  exports: [GazoilService, MongooseModule]
})
export class GazoilModule {}
