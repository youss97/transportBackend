import { Module } from '@nestjs/common';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsService } from './company-settings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySettings, CompanySettingsSchema } from 'src/schemas/company-settings.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CompanySettings.name, schema: CompanySettingsSchema }])],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService],
  exports: [CompanySettingsService],
})
export class CompanySettingsModule {}

