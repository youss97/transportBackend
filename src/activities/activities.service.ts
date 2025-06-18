import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityType } from 'src/enums/activity-type.enum';
import { Activity } from 'src/schemas/activity.schema';
import { CreateActivityDto } from 'src/schemas/create-activity.dto';
import { VehiclesService } from 'src/vehciles/vehciles.service';


@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private vehiclesService: VehiclesService,
  ) {}

  async create(userId: string, createActivityDto: CreateActivityDto,companyId:string): Promise<Activity> {
    const vehicle = await this.vehiclesService.findOne(createActivityDto.vehicleId);
    
    const activity = new this.activityModel({
      ...createActivityDto,
      driver: userId,
      company: companyId,
      vehicle: createActivityDto.vehicleId,
      timestamp: createActivityDto.timestamp || new Date(),
    });

    const savedActivity = await activity.save();

    if (createActivityDto.kilometers) {
      await this.vehiclesService.updateKilometers(
        createActivityDto.vehicleId, 
        createActivityDto.kilometers
      );
    }

    return savedActivity.populate([
      { path: 'driver', select: 'firstName lastName' },
      { path: 'vehicle', select: 'licensePlate' }
    ]);
  }

  async findByDriver(driverId: string, limit: number = 50): Promise<Activity[]> {
    return this.activityModel.find({ driver: driverId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' }
      ])
      .exec();
  }

  async findByVehicle(vehicleId: string, limit: number = 50): Promise<Activity[]> {
    return this.activityModel.find({ vehicle: vehicleId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' }
      ])
      .exec();
  }

  async findPendingValidation(companyId:string): Promise<Activity[]> {
    return this.activityModel.find({ validated: false,company: companyId })
      .sort({ timestamp: -1 })
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' }
      ])
      .exec();
  }

  async validateActivity(activityId: string, supervisorId: string): Promise<Activity> {
    const activity = await this.activityModel.findByIdAndUpdate(
      activityId,
      { 
        validated: true,
        validatedBy: supervisorId 
      },
      { new: true }
    ).populate([
      { path: 'driver', select: 'firstName lastName' },
      { path: 'vehicle', select: 'licensePlate' }
    ]).exec();

    if (!activity) {
      throw new NotFoundException('Activité non trouvée');
    }
    return activity;
  }

  async getDailyWorkHours(driverId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await this.activityModel.find({
      driver: driverId,
      type: { $in: [ActivityType.CLOCK_IN, ActivityType.CLOCK_OUT] },
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ timestamp: 1 }).exec();

    let totalHours = 0;
    let clockInTime = null;

    for (const activity of activities) {
      if (activity.type === ActivityType.CLOCK_IN) {
        clockInTime = activity.timestamp;
      } else if (activity.type === ActivityType.CLOCK_OUT && clockInTime) {
        const hours = (activity.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        clockInTime = null;
      }
    }

    return totalHours;
  }
}
