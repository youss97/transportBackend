import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { PointageService } from './pointage.service';
import { PointageController } from './pointage.controller';
import { Pointage, PointageSchema } from 'src/schemas/pointage.schema';
import { CompanySettings, CompanySettingsSchema } from 'src/schemas/company-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pointage.name, schema: PointageSchema }]),
        MongooseModule.forFeature([{ name: CompanySettings.name, schema: CompanySettingsSchema }]),

    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [PointageController],
  providers: [PointageService],
  exports: [PointageService,MongooseModule],
})
export class PointageModule {}