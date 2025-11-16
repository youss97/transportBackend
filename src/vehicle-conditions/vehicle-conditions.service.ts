import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  ConditionStatus,
  VehicleCondition,
} from 'src/schemas/vehicle-conditions.schema';
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

  // Méthode pour créer une condition et initialiser son statut à 'pending'
  async createConditionFromDriver(currentUser: any, files: any) {
  const vehicle = await this.vehicleModel.findOne({
    currentDrivers: { $in: [new Types.ObjectId(currentUser.userId)] },
  });
    if (!vehicle) {
      throw new NotFoundException('No vehicle assigned to this driver.');
    }

    const uploaded = {};

    // Utilisation de Cloudinary pour uploader les fichiers
    for (const key in files) {
      if (files[key][0]) {
        const result = await this.cloudinary.uploadImage(files[key][0].buffer);
        uploaded[key] = result.secure_url;
      }
    }

    // Création du document avec le statut 'pending'
    const newEntry = new this.conditionModel({
      driverId: new Types.ObjectId(currentUser.userId),
      vehicleId: vehicle._id,
      status: ConditionStatus.PENDING, // Initialisation à 'pending'
      ...uploaded, // Ajout des images à partir de Cloudinary
    });

    return newEntry.save();
  }

  // Méthode pour obtenir la dernière condition d'un véhicule pour un conducteur
async getLatestConditionForCurrentUser(currentUser: any): Promise<VehicleCondition> {
  console.log('Current User:', currentUser);

  const vehicle = await this.vehicleModel.findOne({
    currentDrivers: { $in: [new Types.ObjectId(currentUser.userId)] },
  });

  if (!vehicle) {
    throw new NotFoundException('No vehicle assigned to this driver.');
  }

  const latestCondition = await this.conditionModel
    .findOne({
      driverId: new Types.ObjectId(currentUser.userId),
      vehicleId: vehicle._id,
    })
    .sort({ createdAt: -1 })
    .exec();

  if (!latestCondition) {
    throw new NotFoundException(
      'No vehicle condition found for this driver and vehicle.',
    );
  }

  return latestCondition;
}


  // Méthode pour changer le statut de la condition
  async changeStatus(
    id: string,
    newStatus: ConditionStatus,
  ): Promise<VehicleCondition> {
    const condition = await this.conditionModel.findById(id);
    if (!condition) {
      throw new NotFoundException('Vehicle condition not found');
    }

    // Mise à jour du statut
    condition.status = newStatus;
    return condition.save();
  }
  async getConditionsByVehicleId(
    vehicleId: string,
  ): Promise<VehicleCondition[]> {
    const conditions = await this.conditionModel
      .find({ vehicleId: vehicleId })
      .populate('driverId') // ⬅️ Important
      .populate('vehicleId') // ⬅️ Important
      .sort({ createdAt: -1 })
      .exec();

    if (!conditions || conditions.length === 0) {
      throw new NotFoundException('No conditions found for this vehicle.');
    }

    return conditions;
  }
  async findAllByVehicleId(vehicleId: string): Promise<VehicleCondition[]> {
    const vehicleObjectId = new Types.ObjectId(vehicleId);

    const conditions = await this.conditionModel
      .find({ vehicleId: vehicleObjectId })
      .populate('driverId') // <-- populate driver info
      .populate('vehicleId') // <-- optional: populate vehicle info
      .sort({ createdAt: -1 })
      .exec();

    if (!conditions || conditions.length === 0) {
      throw new NotFoundException('No conditions found for this vehicle.');
    }

    return conditions;
  }

  async getConditionsByCompany(companyId: string): Promise<VehicleCondition[]> {
  const vehicles = await this.vehicleModel.find({ company: companyId }).select('_id');

  if (!vehicles || vehicles.length === 0) {
    throw new NotFoundException('No vehicles found for this company.');
  }

  const vehicleIds = vehicles.map(v => v._id);

  // Récupérer toutes les conditions liées à ces véhicules
  const conditions = await this.conditionModel
    .find({ vehicleId: { $in: vehicleIds } })
    .populate('driverId')
    .populate('vehicleId')
    .sort({ createdAt: -1 })
    .exec();

  if (!conditions || conditions.length === 0) {
    throw new NotFoundException('No vehicle conditions found for this company.');
  }

  return conditions;
}

}
