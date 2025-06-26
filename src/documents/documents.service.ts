import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentEntity } from '../schemas/document.schema';
import { DocumentType } from 'src/enums/document-type.enum';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DocumentStatus } from 'src/enums/document-status.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name)
    private readonly documentModel: Model<DocumentEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    type: DocumentType,
    companyId?: string,
    ownerId?: string,
    vehicleId?: string,
    activityId?: string,
    expirationDate?: Date,
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    // Valider le type de document et les champs associés
    if (type === DocumentType.COMPANY_LOGO && !companyId) {
      throw new BadRequestException(
        'Le logo de société doit avoir un companyId.',
      );
    }

    if (type !== DocumentType.COMPANY_LOGO && companyId) {
      throw new BadRequestException(
        'companyId ne peut être utilisé que pour un logo de société.',
      );
    }

    const cloudinaryRes = await this.cloudinaryService.uploadFile(file);

    const document = new this.documentModel({
      fileName: cloudinaryRes.public_id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: cloudinaryRes.secure_url,
      type,
      company: companyId,
      owner: ownerId,
      vehicle: vehicleId,
      activity: activityId,
      expirationDate,
      status : DocumentStatus.PENDING, // Default to PENDING if not provided
    });

    return document.save();
  }
  async updateDocumentStatus(
    id: string,
    status: DocumentStatus,
  ): Promise<DocumentEntity> {
    const document = await this.documentModel
      .findByIdAndUpdate(
        id,
        { status },
        { new: true }, // Return the updated document
      )
      .exec();

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }
    return document;
  }
  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    try {
      await this.cloudinaryService.deleteFile(document.fileName);
    } catch (err) {
      console.warn(
        `Erreur lors de la suppression sur Cloudinary : ${err.message}`,
      );
    }

    await this.documentModel.findByIdAndDelete(id).exec();
  }

  async getDocument(
    id: string,
  ): Promise<{ document: DocumentEntity; filePath: string }> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return {
      document,
      filePath: document.path,
    };
  }

  async findByOwner(ownerId: string): Promise<DocumentEntity[]> {
    return this.documentModel.find({ owner: ownerId }).exec();
  }

  async findByVehicle(vehicleId: string): Promise<DocumentEntity[]> {
    return this.documentModel.find({ vehicle: vehicleId }).exec();
  }

  async findExpiringSoon(days: number = 30): Promise<DocumentEntity[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.documentModel
      .find({
        expirationDate: { $gte: now, $lte: future },
        isValid: true,
      })
      .populate('owner', 'firstName lastName')
      .populate('vehicle', 'licensePlate')
      .exec();
  }

  async findByTypeAndUser(
    type: DocumentType,
    userId: string,
  ): Promise<DocumentEntity> {
    return this.documentModel
      .findOne({
        type,
        owner: userId,
      })
      .exec();
  }
}
