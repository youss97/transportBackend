import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from 'src/schemas/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto, companyId: string): Promise<User> {
    // Vérifier si l'email existe déjà DANS LA MÊME SOCIÉTÉ
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
      company: companyId, // AJOUT CRUCIAL
    });
    
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà dans cette société');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      company: companyId, 
    });

    return user.save();
  }

  async findAll(companyId: string): Promise<User[]> {
    return this.userModel
      .find({ 
        company: companyId, 
        isActive: true 
      })
      .select('-password')
      .populate('company', 'name slug') 
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ 
        _id: id, 
        company: companyId 
      })
      .select('-password')
      .populate('company', 'name slug')
      .exec();
      
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findByEmailAndCompany(email: string, companyId: string): Promise<User> {
    return this.userModel.findOne({ 
      email, 
      company: companyId,
      isActive: true 
    }).exec();
  }

  async updatePerformanceScore(userId: string, score: number, companyId: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, company: companyId }, // FILTRE PAR SOCIÉTÉ
        { performanceScore: score }, 
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
    companyId: string, // NOUVEAU PARAMÈTRE
  ): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, company: companyId }, // FILTRE PAR SOCIÉTÉ
        updateUserDto, 
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findOneAndUpdate(
      { 
        _id: id, 
      },
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return { message: 'Utilisateur désactivé avec succès' };
  }

  // NOUVELLES MÉTHODES UTILES POUR LA GESTION MULTI-SOCIÉTÉ

  async findDriversByCompany(companyId: string): Promise<User[]> {
    return this.userModel
      .find({ 
        company: companyId, 
        role: 'driver', // ou UserRole.DRIVER selon votre enum
        isActive: true 
      })
      .select('-password')
      .exec();
  }

  async findAdminsByCompany(companyId: string): Promise<User[]> {
    return this.userModel
      .find({ 
        company: companyId, 
        role: { $in: ['admin', 'supervisor'] }, // Selon votre enum
        isActive: true 
      })
      .select('-password')
      .exec();
  }

  async countUsersByCompany(companyId: string): Promise<number> {
    return this.userModel.countDocuments({ 
      company: companyId, 
      isActive: true 
    });
  }

  async findUsersByRole(companyId: string, role: string): Promise<User[]> {
    return this.userModel
      .find({ 
        company: companyId, 
        role: role,
        isActive: true 
      })
      .select('-password')
      .exec();
  }

  async searchUsers(
  companyId: string,
  filters: { firstName?: string; lastName?: string; role?: string }
): Promise<User[]> {
  const query: any = {
    company: companyId,
    isActive: true,
  };

  if (filters.firstName) {
    query.firstName = { $regex: filters.firstName, $options: 'i' }; 
  }

  if (filters.lastName) {
    query.lastName = { $regex: filters.lastName, $options: 'i' };
  }

  if (filters.role) {
    query.role = filters.role;
  }

  return this.userModel.find(query).select('-password').exec();
}

}
