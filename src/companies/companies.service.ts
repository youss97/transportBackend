import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

import { Model } from 'mongoose';
import { UserRole } from 'src/enums/user-role.enum';
import { Company } from 'src/schemas/company.schema';
import { CreateCompanyDto } from 'src/schemas/create-company.dto';
import { UpdateCompanyDto } from 'src/schemas/update-company.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const { adminUser, ...companyData } = createCompanyDto;

    // Vérifier si une société existe déjà
    const existingCompany = await this.companyModel.findOne({
      $or: [
        { name: companyData.name },
        { email: companyData.email },
        { slug: companyData.slug },
      ],
    });

    if (existingCompany) {
      throw new ConflictException(
        'Une société avec ce nom, email ou slug existe déjà',
      );
    }

    // Créer la société
    const createdCompany = await new this.companyModel(companyData).save();

    // Vérifier si un utilisateur admin existe déjà (évite les doublons si besoin)
    const existingUser = await this.userModel.findOne({
      email: adminUser.email,
      company: createdCompany._id,
    });

    if (existingUser) {
      throw new ConflictException(
        'Un utilisateur avec cet email existe déjà dans cette société',
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Créer l'utilisateur admin
    const newAdmin = new this.userModel({
      ...adminUser,
      password: hashedPassword,
      role: UserRole.ADMIN,
      company: createdCompany._id,
    });

    await newAdmin.save();

    return createdCompany;
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
