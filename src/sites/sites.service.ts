import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSiteDto } from 'src/schemas/update-sites.dto';
import { CreateSiteDto } from 'src/schemas/create-sites.dto';
import { Site, SiteDocument } from 'src/schemas/sites.schema';
import { compare } from 'bcryptjs';

@Injectable()
export class SitesService {
  constructor(@InjectModel(Site.name) private siteModel: Model<SiteDocument>) {}

  async create(createSiteDto: CreateSiteDto & { companyId: string }) {
    console.log('Creating site with data:', createSiteDto);
    const newSite = new this.siteModel({
      ...createSiteDto,
      company: createSiteDto.companyId,
    });
    return newSite.save();
  }

  async findAll(companyId: string) {
    return this.siteModel.find({ company :companyId }).populate('company').exec();
  }
  async findAllWithoutCompany() {
    return this.siteModel.find().populate('company').exec();
  }

  async findOne(id: string, companyId: string) {
    const site = await this.siteModel.findOne({ _id: id, company :companyId }).populate('company').exec();
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async update(id: string, updateSiteDto: UpdateSiteDto, companyId: string) {
    const updatedSite = await this.siteModel.findOneAndUpdate(
      { _id: id, company:companyId },
      updateSiteDto,
      { new: true },
    );
    if (!updatedSite) throw new NotFoundException('Site not found');
    return updatedSite;
  }

  async remove(id: string) {
    const deletedSite = await this.siteModel.findOneAndDelete({
      _id: id,
    });
    if (!deletedSite) throw new NotFoundException('Site not found');
    return deletedSite;
  }
}
