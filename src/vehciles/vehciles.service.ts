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
    private readonly cloudinaryService: CloudinaryService,
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
    console.log(companyId,"company")
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
        .populate('currentDrivers', 'firstName lastName')
        .exec(),
      this.vehicleModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(id).populate('currentDrivers', 'firstName lastName').exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

  async assignDrivers(
    vehicleId: string,
    driverIds: string[],
    companyId: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleModel
      .findOneAndUpdate(
        { _id: vehicleId, company: companyId },
        {
          currentDrivers: driverIds,
          status: driverIds.length > 0 ? VehicleStatus.IN_USE : VehicleStatus.AVAILABLE,
        },
        { new: true },
      )
      .populate('currentDrivers', 'firstName lastName')
      .exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return vehicle;
  }

async unassignDrivers(
  vehicleId: string,
  companyId: string,
  driverIdsToRemove: string[],  // tableau d'IDs à retirer
): Promise<Vehicle> {
  const vehicle = await this.vehicleModel.findOne({ _id: vehicleId, company: companyId });

  if (!vehicle) {
    throw new NotFoundException('Véhicule non trouvé ou accès refusé');
  }

  // Filtrer le tableau currentDrivers pour retirer les driverIds à enlever
  vehicle.currentDrivers = vehicle.currentDrivers.filter(
    (driverId) => !driverIdsToRemove.includes(driverId.toString()),
  );

  // Mettre à jour le status si plus de conducteurs
  vehicle.status = vehicle.currentDrivers.length > 0 ? VehicleStatus.IN_USE : VehicleStatus.AVAILABLE;

  await vehicle.save();

  return vehicle.populate('currentDrivers');
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

    if (files?.carteGriseFile?.[0]) {
      const upload = await this.cloudinaryService.uploadFile(files.carteGriseFile[0]);
      updateData.carteGriseFile = upload.secure_url;
    }
    if (files?.insuranceFile?.[0]) {
      const upload = await this.cloudinaryService.uploadFile(files.insuranceFile[0]);
      updateData.insuranceFile = upload.secure_url;
    }
    if (files?.technicalControlFile?.[0]) {
      const upload = await this.cloudinaryService.uploadFile(files.technicalControlFile[0]);
      updateData.technicalControlFile = upload.secure_url;
    }

    return this.vehicleModel.findOneAndUpdate(
      { _id: id, company: companyId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    );
  }

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
    const vehicle = await this.vehicleModel.findOne({ currentDrivers: driverId }).populate('currentDrivers').exec();

    if (!vehicle) {
      throw new NotFoundException('Aucun véhicule trouvé pour ce chauffeur');
    }

    return vehicle;
  }
}

