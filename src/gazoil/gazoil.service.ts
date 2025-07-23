// src/gazoil/gazoil.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateGazoilDto } from 'src/schemas/create-gazoil.dto';
import { Gazoil } from 'src/schemas/gazoil.schema';

@Injectable()
export class GazoilService {
  constructor(
    @InjectModel(Gazoil.name) private gazoilModel: Model<Gazoil>,
    private cloudinaryService: CloudinaryService,
  ) {}
  async create(
    dto: CreateGazoilDto,
    files: {
      montantPhoto?: Express.Multer.File[];
      kilometragePhoto?: Express.Multer.File[];
    },
    driverId: string,
    companyId: string,
  ) {
    // Vérifie si les fichiers sont présents
    const montantPhoto = files.montantPhoto?.[0]; // Récupère le premier fichier pour kilometrage
    const kilometragePhoto = files.kilometragePhoto?.[0]; // Récupère le premier fichier pour gazoil

    if (!montantPhoto || !kilometragePhoto) {
      throw new Error(
        'Les deux images (kilométrage et gazoil) sont nécessaires.',
      );
    }

    // Upload des fichiers sur Cloudinary
    const uploadedKilometrage = await this.cloudinaryService.uploadFile(
      kilometragePhoto,
    );
    const uploadedGazoil = await this.cloudinaryService.uploadFile(
      montantPhoto,
    );

    // Création de l'entrée dans la base de données
    const created = new this.gazoilModel({
      driverId,
      companyId,
      comment: dto.comment,
      kilometragePhoto: uploadedKilometrage.secure_url,
      montantPhoto: uploadedGazoil.secure_url,
    });

    return created.save();
  }

  async findAll(companyId: string) {
    return this.gazoilModel
      .find({ companyId })
      .populate('driverId', 'fullName');
  }

  async findById(id: string) {
    const gazoil = await this.gazoilModel
      .findById(id)
      .populate('driverId', 'fullName');
    if (!gazoil) throw new NotFoundException('Gazoil not found');
    return gazoil;
  }
}
