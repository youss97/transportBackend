import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentEntity } from '../schemas/document.schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name) private documentModel: Model<DocumentEntity>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    type: DocumentType,
    ownerId?: string,
    vehicleId?: string,
    activityId?: string,
    expirationDate?: Date
  ): Promise<DocumentEntity> {
    const document = new this.documentModel({
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      type,
      owner: ownerId,
      vehicle: vehicleId,
      activity: activityId,
      expirationDate,
    });

    return document.save();
  }

  async findByOwner(ownerId: string): Promise<DocumentEntity[]> {
    return this.documentModel.find({ owner: ownerId }).exec();
  }

  async findByVehicle(vehicleId: string): Promise<DocumentEntity[]> {
    return this.documentModel.find({ vehicle: vehicleId }).exec();
  }

  async findExpiringSoon(days: number = 30): Promise<DocumentEntity[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.documentModel.find({
      expirationDate: { $lte: futureDate, $gte: new Date() },
      isValid: true
    }).populate('owner', 'firstName lastName')
      .populate('vehicle', 'licensePlate')
      .exec();
  }

  async getDocument(id: string): Promise<{ document: DocumentEntity; filePath: string }> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return {
      document,
      filePath: document.path
    };
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    // Supprimer le fichier physique
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await this.documentModel.findByIdAndDelete(id).exec();
  }
}