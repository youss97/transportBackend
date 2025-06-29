import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

import { Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
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
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    logoFile?: Express.Multer.File,
    adminPhotoFile?: Express.Multer.File,
  ): Promise<Company> {
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

    // Upload du logo si un fichier est fourni
    if (logoFile) {
      const cloudinaryRes = await this.cloudinaryService.uploadFile(logoFile);
      companyData.logo = cloudinaryRes.secure_url; // Enregistre l'URL du logo
    }

    // Créer la société
    const createdCompany = await new this.companyModel(companyData).save();

    // Vérifier si un utilisateur admin existe déjà
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

    // Si une photo de l'admin est fournie, la télécharger sur Cloudinary
    if (adminPhotoFile) {
      const cloudinaryRes = await this.cloudinaryService.uploadFile(
        adminPhotoFile,
      );
      newAdmin.photo = cloudinaryRes.secure_url; // Enregistre l'URL de la photo
    }

    await newAdmin.save();

    return createdCompany;
  }

 async findAll(page = 1, limit = 10, search = ''): Promise<{
  data: Company[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };

  if (search) {
    query.name = { $regex: search, $options: 'i' }; 
  }

  const [data, total] = await Promise.all([
    this.companyModel.find(query).skip(skip).limit(limit).exec(),
    this.companyModel.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    limit,
  };
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
  logoFile?: Express.Multer.File,
): Promise<Company> {
  const company = await this.companyModel.findById(id).exec();

  if (!company) {
    throw new NotFoundException('Société non trouvée');
  }

  // Nettoyer et préparer les données de mise à jour
  const updateData: any = {};
  
  // Copier seulement les champs qui ont des valeurs valides
  Object.keys(updateCompanyDto).forEach(key => {
    const value = updateCompanyDto[key];
    if (value !== undefined && value !== null && value !== '') {
      updateData[key] = value;
    }
  });

  // Vérifier si un nouveau logo est fourni
  if (logoFile) {
    if (company.logo) {
      const publicId = company.logo.split('/').pop()?.split('.')[0];
      await this.cloudinaryService.deleteFile(publicId);
    }
    const cloudinaryRes = await this.cloudinaryService.uploadFile(logoFile);
    updateData.logo = cloudinaryRes.secure_url;
  }

  // Mettre à jour la société avec les nouvelles informations
  const updatedCompany = await this.companyModel
    .findByIdAndUpdate(id, updateData, { new: true })
    .exec();

  if (!updatedCompany) {
    throw new NotFoundException('Société non trouvée');
  }

  return updatedCompany;
}
  async delete(id: string): Promise<void> {
    const company = await this.companyModel.findById(id).exec();

    if (!company) {
      throw new NotFoundException('Société non trouvée');
    }

    // Si un logo existe, le supprimer de Cloudinary
    if (company.logo) {
      const publicId = company.logo.split('/').pop()?.split('.')[0]; // Extraire le publicId
      await this.cloudinaryService.deleteFile(publicId); // Supprimer le logo de Cloudinary
    }

    // Désactiver la société (soft delete)
    await this.companyModel.findByIdAndUpdate(id, { isActive: false }).exec();
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
