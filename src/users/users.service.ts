import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from 'src/schemas/create-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    companyId: string,
    photo?: Express.Multer.File,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
      company: companyId,
    });
    if (existingUser) {
      throw new ConflictException(
        'Un utilisateur avec cet email existe déjà dans cette société',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Upload de la photo si elle est présente
    let photoUrl: string = null;
    if (photo) {
      const cloudinaryRes = await this.cloudinaryService.uploadFile(photo);
      photoUrl = cloudinaryRes.secure_url;
    }

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      company: companyId,
      photo: photoUrl, // Ajouter l'URL de la photo
    });

    return user.save();
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
    companyId: string,
    photo?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, company: companyId })
      .exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Hachage du mot de passe si présent
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    // Si une nouvelle photo est téléchargée, on la télécharge sur Cloudinary et on supprime l'ancienne
    if (photo) {
      if (user.photo) {
        const publicId = user.photo.split('/').pop()?.split('.')[0];
        await this.cloudinaryService.deleteFile(publicId);
      }

      const cloudinaryRes = await this.cloudinaryService.uploadFile(photo);
      updateUserDto.photo = cloudinaryRes.secure_url;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprimer la photo de Cloudinary si elle existe
    if (user.photo) {
      const publicId = user.photo.split('/').pop()?.split('.')[0];
      await this.cloudinaryService.deleteFile(publicId);
    }

    // Désactiver l'utilisateur
    await this.userModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return { message: 'Utilisateur désactivé avec succès' };
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const baseQuery: any = {
      company: companyId,
      isActive: true,
    };

    if (search) {
      baseQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(baseQuery)
        .select('-password')
        .populate('company', 'name slug')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(baseQuery),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({
        _id: id,
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
    return this.userModel
      .findOne({
        email,
        company: companyId,
        isActive: true,
      })
      .exec();
  }

  async updatePerformanceScore(
    userId: string,
    score: number,
    companyId: string,
  ): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: userId, company: companyId }, // FILTRE PAR SOCIÉTÉ
        { performanceScore: score },
        { new: true },
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  // NOUVELLES MÉTHODES UTILES POUR LA GESTION MULTI-SOCIÉTÉ

  async findDriversByCompany(companyId: string): Promise<User[]> {
    return this.userModel
      .find({
        company: companyId,
        role: UserRole.DRIVER,
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async findAdminsByCompany(companyId: string): Promise<User[]> {
    return this.userModel
      .find({
        company: companyId,
        role: { $in: ['admin', 'supervisor'] }, // Selon votre enum
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async countUsersByCompany(companyId: string): Promise<number> {
    return this.userModel.countDocuments({
      company: companyId,
      isActive: true,
    });
  }

  async findUsersByRole(companyId: string, role: string): Promise<User[]> {
    return this.userModel
      .find({
        company: companyId,
        role: role,
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async searchUsers(
    companyId: string,
    filters: { firstName?: string; lastName?: string; role?: string },
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
  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.refreshToken !== refreshToken) return null;
    return user;
  }
  async deleteUserAndReferences(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    await this.userModel.deleteOne({ _id: userId });

    const collections = await this.connection.db.listCollections().toArray();

    for (const col of collections) {
      const collection = this.connection.db.collection(col.name);
      try {
        const result = await collection.deleteMany({
          $or: [
            { driver: new Types.ObjectId(userId) },
            { currentDriver: new Types.ObjectId(userId) },
            { userId: new Types.ObjectId(userId) },
            { owner: new Types.ObjectId(userId) },

            { _id: new Types.ObjectId(userId) },
          ],
        });

        if (result.deletedCount > 0) {
          console.log(`✅ ${result.deletedCount} supprimés de ${col.name}`);
        }
      } catch (err) {
        console.warn(`⚠️ Erreur suppression ${col.name} : ${err.message}`);
      }
    }

    return { message: 'Utilisateur et ses références supprimés' };
  }
    async delete(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return { message: 'Utilisateur supprimé avec succès' };
  }
}
