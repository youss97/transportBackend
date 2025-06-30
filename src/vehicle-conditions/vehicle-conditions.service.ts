import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserRole } from 'src/enums/user-role.enum';
import { VehicleCondition } from 'src/schemas/vehicle-conditions.schema';
import { Vehicle } from 'src/schemas/vehicle.schema';

@Injectable()
export class VehicleConditionsService {
  constructor(
    @InjectModel(VehicleCondition.name)
    private conditionModel: Model<VehicleCondition>,
    @InjectModel('Vehicle')
    private vehicleModel: Model<Vehicle>,
    private cloudinary: CloudinaryService,
  ) {}
 async createConditionFromDriver(currentUser: any, files: any) {
    console.log('Creating condition from driver:', currentUser, files);

    const vehicle = await this.vehicleModel.findOne({ currentDriver: currentUser.userId });
    if (!vehicle) {
      throw new NotFoundException('No vehicle assigned to this driver.');
    }

    const uploaded = {};

    // Utilisation de Cloudinary pour uploader les fichiers
    for (const key in files) {
      if (files[key][0]) {
        // Upload du fichier via Cloudinary
        const result = await this.cloudinary.uploadImage(files[key][0].buffer);

        // On stocke l'URL ou public_id dans l'objet `uploaded`
        uploaded[key] = result.secure_url;  // ou `result.public_id` si tu préfères stocker le public_id
      }
    }

    // Création du document avec les données et l'URL (ou public_id) de l'image
    const newEntry = new this.conditionModel({
      driverId: new Types.ObjectId( currentUser.userId),
      vehicleId: vehicle._id,
      ...uploaded,  // Ajout des images à partir de Cloudinary
    });

    return newEntry.save();
  }

    async getLatestConditionForCurrentUser(currentUser: any): Promise<VehicleCondition> {
    // Trouver le véhicule associé au chauffeur actuel
    const vehicle = await this.vehicleModel.findOne({ currentDriver: currentUser.userId });

    if (!vehicle) {
      throw new NotFoundException('No vehicle assigned to this driver.');
    }

    // Recherche de la dernière condition du véhicule pour ce chauffeur et ce véhicule
    const latestCondition = await this.conditionModel
      .findOne({ driverId: new Types.ObjectId( currentUser.userId), vehicleId: vehicle._id })
      .sort({ createdAt: -1 }) // Trie par date de la condition
      .exec();

    if (!latestCondition) {
      throw new NotFoundException('No vehicle condition found for this driver and vehicle.');
    }

    return latestCondition;
  }
}


