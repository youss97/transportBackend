import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle } from 'src/schemas/vehicle.schema';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';
import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UpdateVehicleDto } from 'src/schemas/update-vehicle.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'; // Import du service Cloudinary

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    private readonly cloudinaryService: CloudinaryService, // Injection du service Cloudinary
  ) {}

async create(
  dto: CreateVehicleDto,
  files: {
    carteGriseFile?: Express.Multer.File[];
    insuranceFile?: Express.Multer.File[];
    technicalControlFile?: Express.Multer.File[];
  },
   companyId: string, 
) {
  const fileUrls = {
    carteGriseFile: null,
    insuranceFile: null,
    technicalControlFile: null,
  };

  if (files.carteGriseFile?.[0]) {
    const result = await this.cloudinaryService.uploadFile(files.carteGriseFile[0]);
    fileUrls.carteGriseFile = result.secure_url;
  }
  if (files.insuranceFile?.[0]) {
    const result = await this.cloudinaryService.uploadFile(files.insuranceFile[0]);
    fileUrls.insuranceFile = result.secure_url;
  }
  if (files.technicalControlFile?.[0]) {
    const result = await this.cloudinaryService.uploadFile(files.technicalControlFile[0]);
    fileUrls.technicalControlFile = result.secure_url;
  }

  const newVehicle = new this.vehicleModel({
    ...dto,
    company: companyId,
    carteGriseFile: fileUrls.carteGriseFile,
    insuranceFile: fileUrls.insuranceFile,
    technicalControlFile: fileUrls.technicalControlFile,
  });

  return newVehicle.save();
}


  async findAll(
    companyId: string,
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const query: any = {
      company: companyId,
    };

    if (search) {
      query.$or = [
        { modelCar: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { fuelType: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.vehicleModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.vehicleModel.countDocuments(query),
    ]);
  data.forEach(vehicle => {
    if (!vehicle.currentDriver ) {
      vehicle.currentDriver = null;
    } else if (typeof vehicle.currentDriver === 'string' && Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = new Types.ObjectId(vehicle.currentDriver);
    } else if (!Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = null;
    }
  });
  const toPopulate = [];

   data.forEach(vehicle => {
    const driver = vehicle.currentDriver;
    if (typeof driver === 'string') {
      if (Types.ObjectId.isValid(driver)) {
        // Convertir string valide en ObjectId
        vehicle.currentDriver = new Types.ObjectId(driver);
        toPopulate.push(vehicle);
      } else {
        // Invalide => on garde comme ça (pas de populate)
        vehicle.currentDriver = new Types.ObjectId(driver); 
      }
    } else if (driver instanceof Types.ObjectId) {
      // Déjà ObjectId
      toPopulate.push(vehicle);
    } else {
      // null, undefined ou autre => pas de populate
      vehicle.currentDriver = driver;
    }
  });

  // Populate uniquement sur les vehicles avec currentDriver ObjectId
  await this.vehicleModel.populate(toPopulate, { path: 'currentDriver' });


    return {
      data,
      total,
      page,
      limit,
    };
  }

async findOne(id: string): Promise<Vehicle> {
  const vehicle = await this.vehicleModel.findById(id).exec();

  if (!vehicle) {
    throw new NotFoundException('Véhicule non trouvé');
  }

  // Gestion currentDriver avant populate
  if (vehicle.currentDriver) {
    if (typeof vehicle.currentDriver === 'string' && Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = new Types.ObjectId(vehicle.currentDriver);
    } else if (!Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = null;
    }
  } else {
    vehicle.currentDriver = null;
  }

  // Populate si currentDriver est un ObjectId valide
  if (vehicle.currentDriver instanceof Types.ObjectId) {
    await vehicle.populate('currentDriver');
  }

  return vehicle;
}


  async assignDriver(
    vehicleId: string,
    driverId: string,
    companyId: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(
        vehicleId,
        {
          currentDriver: driverId,
          company: companyId,
          status: VehicleStatus.IN_USE,
        },
        { new: true },
      )
      .populate('currentDriver', 'firstName lastName')
      .exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }
    return vehicle;
  }

  async unassignDriver(vehicleId: string, companyId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findOneAndUpdate(
      { _id: vehicleId, company: companyId },
      {
        $unset: { currentDriver: '' },
        status: VehicleStatus.AVAILABLE,
      },
      { new: true },
    );

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé ou accès refusé');
    }

    return vehicle;
  }

async updateVehicle(
  id: string,
  companyId: string,
  updateData: UpdateVehicleDto,
  files?: {
    carteGriseFile?: Express.Multer.File[];
    insuranceFile?: Express.Multer.File[];
    technicalControlFile?: Express.Multer.File[];
  },
): Promise<Vehicle> {
  const existingVehicle = await this.vehicleModel.findOne({
    _id: id,
    company: companyId,
  });

  if (!existingVehicle) {
    throw new NotFoundException('Véhicule non trouvé ou accès refusé');
  }

  // Carte grise
  if (files?.carteGriseFile?.[0]) {
    const upload = await this.cloudinaryService.uploadFile(files.carteGriseFile[0]);
    updateData.carteGriseFile = upload.secure_url;
  }

  // Assurance
  if (files?.insuranceFile?.[0]) {
    const upload = await this.cloudinaryService.uploadFile(files.insuranceFile[0]);
    updateData.insuranceFile = upload.secure_url;
  }

  // Contrôle technique
  if (files?.technicalControlFile?.[0]) {
    const upload = await this.cloudinaryService.uploadFile(files.technicalControlFile[0]);
    updateData.technicalControlFile = upload.secure_url;
  }

  // Mise à jour du document
  return this.vehicleModel.findOneAndUpdate(
    { _id: id, company: companyId },
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true },
  );
}

  // Supprimer un véhicule
  async deleteVehicle(id: string, companyId: string): Promise<{ deleted: boolean }> {
    const res = await this.vehicleModel.deleteOne({
      _id: id,
      company: companyId,
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Véhicule non trouvé ou accès refusé');
    }

    return { deleted: true };
  }

  async getVehiclesNeedingMaintenance(companyId: string): Promise<Vehicle[]> {
    return this.vehicleModel
      .find({
        company: companyId,
        $expr: {
          $gte: ['$maintenanceKilometers', '$nextMaintenanceKm'],
        },
      })
      .exec();
  }
async findOneByDriver(driverId: string): Promise<Vehicle> {
  // On essaye d'abord de valider driverId

  const vehicle = await this.vehicleModel.findOne({ currentDriver: driverId }).exec();

  if (!vehicle) {
    throw new NotFoundException('Aucun véhicule trouvé pour ce chauffeur');
  }

  // Pareil, on contrôle currentDriver avant populate
  if (vehicle.currentDriver) {
    if (typeof vehicle.currentDriver === 'string' && Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = new Types.ObjectId(vehicle.currentDriver);
    } else if (!Types.ObjectId.isValid(vehicle.currentDriver)) {
      vehicle.currentDriver = null;
    }
  } else {
    vehicle.currentDriver = null;
  }

  if (vehicle.currentDriver instanceof Types.ObjectId) {
    await vehicle.populate('currentDriver');
  }

  return vehicle;
}


}
