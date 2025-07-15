import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSiteDto } from 'src/schemas/update-sites.dto';
import { CreateSiteDto } from 'src/schemas/create-sites.dto';
import { Site, SiteDocument } from 'src/schemas/sites.schema';

@Injectable()
export class SitesService {
  constructor(@InjectModel(Site.name) private siteModel: Model<SiteDocument>) {}

  async create(createSiteDto: CreateSiteDto & { companyId: string }) {
    const newSite = new this.siteModel({
      ...createSiteDto,
      companyId: createSiteDto.companyId,
    });
    return newSite.save();
  }

  async findAll(companyId: string) {
    return this.siteModel.find({ companyId }).exec();
  }
  async findAllWithoutCompany() {
    return this.siteModel.find().exec();
  }

  async findOne(id: string, companyId: string) {
    const site = await this.siteModel.findOne({ _id: id, companyId });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async update(id: string, updateSiteDto: UpdateSiteDto, companyId: string) {
    const updatedSite = await this.siteModel.findOneAndUpdate(
      { _id: id, companyId },
      updateSiteDto,
      { new: true },
    );
    if (!updatedSite) throw new NotFoundException('Site not found');
    return updatedSite;
  }

  async remove(id: string, companyId: string) {
    const deletedSite = await this.siteModel.findOneAndDelete({
      _id: id,
      companyId,
    });
    if (!deletedSite) throw new NotFoundException('Site not found');
    return deletedSite;
  }
}
