import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { PointageService } from './pointage.service';
import { PointageController } from './pointage.controller';
import { Pointage, PointageSchema } from 'src/schemas/pointage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pointage.name, schema: PointageSchema }]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [PointageController],
  providers: [PointageService],
  exports: [PointageService],
})
export class PointageModule {}