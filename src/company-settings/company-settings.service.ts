import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanySettings } from 'src/schemas/company-settings.schema';
import { UpdateSettingsDto } from 'src/schemas/create-company-settings.dto';

@Injectable()
export class CompanySettingsService {
  constructor(@InjectModel(CompanySettings.name) private settingsModel: Model<CompanySettings>) {}

  async getByCompanyId(companyId: string): Promise<CompanySettings> {
    const settings = await this.settingsModel.findOne({ companyId }).exec();
    if (!settings) throw new NotFoundException('Paramètres non trouvés');
    return settings;
  }

  async createOrUpdate(companyId: string, dto: UpdateSettingsDto): Promise<CompanySettings> {
    return this.settingsModel.findOneAndUpdate(
      { companyId },
      { $set: { ...dto, companyId } },
      { new: true, upsert: true }
    ).exec();
  }
  async deleteByCompanyId(companyId: string): Promise<void> {
  const result = await this.settingsModel.deleteOne({ companyId }).exec();
  if (result.deletedCount === 0) {
    throw new NotFoundException('Paramètres non trouvés pour suppression');
  }
}
}