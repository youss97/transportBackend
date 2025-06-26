import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';
import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { UpdateVehicleDto } from 'src/schemas/update-vehicle.dto';
import { Vehicle } from 'src/schemas/vehicle.schema';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
  ) {}

  async create(
    createVehicleDto: CreateVehicleDto,
    companyId: string,
  ): Promise<Vehicle> {
    const existingVehicle = await this.vehicleModel.findOne({
      licensePlate: createVehicleDto.licensePlate,
      company: companyId,
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Un véhicule avec cette immatriculation existe déjà',
      );
    }

    const vehicle = new this.vehicleModel({
      ...createVehicleDto,
      company: companyId,
    });
    return vehicle.save();
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
        .populate('currentDriver', 'firstName lastName')
        .skip(skip)
        .limit(limit)
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

  async findOneByDriver(driverId: string): Promise<Vehicle> {
    return this.vehicleModel.findOne({ currentDriver: driverId }).exec();
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel
      .findById(id)
      .populate('currentDriver', 'firstName lastName')
      .exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
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

  async updateKilometers(
    vehicleId: string,
    kilometers: number,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(
        vehicleId,
        {
          totalKilometers: kilometers,
          maintenanceKilometers: kilometers,
        },
        { new: true },
      )
      .exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }
    return vehicle;
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
  ): Promise<Vehicle> {
    // 1. Récupérer le véhicule existant
    const existingVehicle = await this.vehicleModel.findOne({
      _id: id,
      company: companyId,
    });

    if (!existingVehicle) {
      throw new NotFoundException('Véhicule non trouvé ou accès refusé');
    }

    // 2. Filtrer les champs undefined/null du updateData
    const filteredUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    // 3. Fusionner avec les données existantes
    const mergedData = {
      ...existingVehicle.toObject(),
      ...filteredUpdateData,
      updatedAt: new Date(), // Optionnel: mettre à jour la date de modification
    };

    // 4. Effectuer la mise à jour
    const updatedVehicle = await this.vehicleModel.findOneAndUpdate(
      { _id: id, company: companyId },
      mergedData,
      { new: true, runValidators: true },
    );

    return updatedVehicle;
  }


  async deleteVehicle(
    id: string,
    companyId: string,
  ): Promise<{ deleted: boolean }> {
    const res = await this.vehicleModel.deleteOne({
      _id: id,
      company: companyId,
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Véhicule non trouvé ou accès refusé');
    }

    return { deleted: true };
  }
  async searchVehicles(
    companyId: string,
    filters: { licensePlate?: string; brand?: string; modelCar?: string },
  ): Promise<Vehicle[]> {
    const query: any = {
      company: companyId,
      isActive: true,
    };

    if (filters.licensePlate) {
      query.licensePlate = { $regex: filters.licensePlate, $options: 'i' };
    }

    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' };
    }

    if (filters.modelCar) {
      query.modelCar = { $regex: filters.modelCar, $options: 'i' };
    }

    return this.vehicleModel
      .find(query)
      .populate('currentDriver', 'firstName lastName')
      .exec();
  }
}
