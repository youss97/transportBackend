import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';
import { CreateVehicleDto } from 'src/schemas/create-vehicle.dto';
import { Vehicle } from 'src/schemas/vehicle.schema';


@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleModel.findOne({ 
      licensePlate: createVehicleDto.licensePlate 
    });
    
    if (existingVehicle) {
      throw new ConflictException('Un véhicule avec cette immatriculation existe déjà');
    }

    const vehicle = new this.vehicleModel(createVehicleDto);
    return vehicle.save();
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleModel.find().populate('currentDriver', 'firstName lastName').exec();
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(id)
      .populate('currentDriver', 'firstName lastName')
      .exec();
    
    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }
    return vehicle;
  }

  async assignDriver(vehicleId: string, driverId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { 
        currentDriver: driverId,
        status: VehicleStatus.IN_USE 
      },
      { new: true }
    ).populate('currentDriver', 'firstName lastName').exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }
    return vehicle;
  }

  async updateKilometers(vehicleId: string, kilometers: number): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { 
        totalKilometers: kilometers,
        maintenanceKilometers: kilometers
      },
      { new: true }
    ).exec();

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }
    return vehicle;
  }

  async getVehiclesNeedingMaintenance(): Promise<Vehicle[]> {
    return this.vehicleModel.find({
      $expr: {
        $gte: ['$maintenanceKilometers', '$nextMaintenanceKm']
      }
    }).exec();
  }
}