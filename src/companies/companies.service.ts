import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/schemas/company.schema';
import { CreateCompanyDto } from 'src/schemas/create-company.dto';
import { UpdateCompanyDto } from 'src/schemas/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const existingCompany = await this.companyModel.findOne({
      $or: [
        { name: createCompanyDto.name },
        { email: createCompanyDto.email },
        { slug: createCompanyDto.slug },
      ],
    });

    if (existingCompany) {
      throw new ConflictException(
        'Une société avec ce nom, email ou slug existe déjà',
      );
    }

    const company = new this.companyModel(createCompanyDto);
    return company.save();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find({ isActive: true }).exec();
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Société non trouvée');
    }
    return company;
  }

  async findBySlug(slug: string): Promise<Company> {
    const company = await this.companyModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!company) {
      throw new NotFoundException('Société non trouvée');
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .exec();

    if (!company) {
      throw new NotFoundException('Société non trouvée');
    }

    return company;
  }

  async delete(id: string): Promise<void> {
    const result = await this.companyModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException('Société non trouvée');
    }
  }

  async getCompanyStats(companyId: string) {
    return {
      companyId,
      totalUsers: 0,
      totalVehicles: 0,
      totalActivities: 0,
    };
  }
  async searchByName(name: string): Promise<Company[]> {
    const regex = new RegExp(name, 'i'); 
    return this.companyModel
      .find({
        name: { $regex: regex },
        isActive: true,
      })
      .exec();
  }
}
