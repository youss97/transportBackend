import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityType } from 'src/enums/activity-type.enum';
import { UserRole } from 'src/enums/user-role.enum';
import { Activity } from 'src/schemas/activity.schema';
import { User } from 'src/schemas/user.schema';
import { Vehicle } from 'src/schemas/vehicle.schema';


@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getDashboardStats() {
    const [
      totalDrivers,
      totalVehicles,
      availableVehicles,
      pendingActivities,
      todayActivities
    ] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.DRIVER, isActive: true }),
      this.vehicleModel.countDocuments(),
      this.vehicleModel.countDocuments({ status: 'disponible' }),
      this.activityModel.countDocuments({ validated: false }),
      this.activityModel.countDocuments({
        timestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    return {
      totalDrivers,
      totalVehicles,
      availableVehicles,
      pendingActivities,
      todayActivities
    };
  }

  async getDriverPerformance(driverId: string, startDate: Date, endDate: Date) {
    const activities = await this.activityModel.find({
      driver: driverId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).exec();

    const stats = {
      totalActivities: activities.length,
      fuelConsumption: 0,
      totalDistance: 0,
      workHours: 0,
      incidents: 0,
      onTimeRate: 0
    };

    activities.forEach(activity => {
      if (activity.fuelQuantity) stats.fuelConsumption += activity.fuelQuantity;
      if (activity.kilometers) stats.totalDistance += activity.kilometers;
      if (activity.type === ActivityType.INCIDENT) stats.incidents++;
    });

    return stats;
  }

  async getVehicleUtilization(startDate: Date, endDate: Date) {
    const vehicles = await this.vehicleModel.find().exec();
    const utilization = [];

    for (const vehicle of vehicles) {
      const activities = await this.activityModel.find({
        vehicle: vehicle._id,
        timestamp: { $gte: startDate, $lte: endDate }
      }).exec();

      const workingDays = activities.filter(a => 
        a.type === ActivityType.CLOCK_IN || a.type === ActivityType.CLOCK_OUT
      ).length / 2;

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const utilizationRate = (workingDays / totalDays) * 100;

      utilization.push({
        vehicle: {
          id: vehicle._id,
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model
        },
        utilizationRate: Math.round(utilizationRate),
        workingDays,
        totalActivities: activities.length
      });
    }

    return utilization;
  }

  async getFuelConsumptionReport(startDate: Date, endDate: Date) {
    const fuelActivities = await this.activityModel.find({
      type: ActivityType.FUEL,
      timestamp: { $gte: startDate, $lte: endDate }
    }).populate('driver', 'firstName lastName')
      .populate('vehicle', 'licensePlate brand model')
      .exec();

    const totalConsumption = fuelActivities.reduce((sum, activity) => 
      sum + (activity.fuelQuantity || 0), 0
    );

    const totalCost = fuelActivities.reduce((sum, activity) => 
      sum + ((activity.fuelQuantity || 0) * (activity.fuelPrice || 0)), 0
    );

    return {
      totalConsumption,
      totalCost,
      averagePricePerLiter: totalConsumption > 0 ? totalCost / totalConsumption : 0,
      fuelActivities: fuelActivities.map(activity => ({
        date: activity.timestamp,
        driver: activity.driver,
        vehicle: activity.vehicle,
        quantity: activity.fuelQuantity,
        price: activity.fuelPrice,
        cost: (activity.fuelQuantity || 0) * (activity.fuelPrice || 0),
        station: activity.fuelStation
      }))
    };
  }

  async getMaintenanceReport() {
    const vehicles = await this.vehicleModel.find().exec();
    const maintenanceNeeded = [];
    const maintenanceScheduled = [];

    for (const vehicle of vehicles) {
      const kmUntilMaintenance = vehicle.nextMaintenanceKm - vehicle.maintenanceKilometers;
      
      if (kmUntilMaintenance <= 0) {
        maintenanceNeeded.push({
          vehicle: {
            id: vehicle._id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model
          },
          currentKm: vehicle.maintenanceKilometers,
          nextMaintenanceKm: vehicle.nextMaintenanceKm,
          overdue: Math.abs(kmUntilMaintenance)
        });
      } else if (kmUntilMaintenance <= 5000) {
        maintenanceScheduled.push({
          vehicle: {
            id: vehicle._id,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model
          },
          currentKm: vehicle.maintenanceKilometers,
          nextMaintenanceKm: vehicle.nextMaintenanceKm,
          remainingKm: kmUntilMaintenance
        });
      }
    }

    return {
      maintenanceNeeded,
      maintenanceScheduled,
      totalVehicles: vehicles.length,
      urgentMaintenance: maintenanceNeeded.length
    };
  }
}