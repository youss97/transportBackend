import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  async create(
    userId: string,
    createActivityDto: CreateActivityDto,
    companyId: string,
  ): Promise<Activity> {
    const vehicle = await this.vehiclesService.findOne(
      createActivityDto.vehicleId,
    );

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
        createActivityDto.kilometers,
      );
    }

    return savedActivity.populate([
      { path: 'driver', select: 'firstName lastName' },
      { path: 'vehicle', select: 'licensePlate' },
    ]);
  }

  async findByDriver(
    driverId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    return this.activityModel
      .find({ driver: driverId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' },
      ])
      .exec();
  }

  async findByVehicle(
    vehicleId: string,
    limit: number = 50,
  ): Promise<Activity[]> {
    return this.activityModel
      .find({ vehicle: vehicleId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' },
      ])
      .exec();
  }

  async findPendingValidation(companyId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ validated: false, company: companyId })
      .sort({ timestamp: -1 })
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' },
      ])
      .exec();
  }

  async validateActivity(
    activityId: string,
    supervisorId: string,
  ): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(
        activityId,
        {
          validated: true,
          validatedBy: supervisorId,
        },
        { new: true },
      )
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' },
      ])
      .exec();

    if (!activity) {
      throw new NotFoundException('Activité non trouvée');
    }
    return activity;
  }

  async getDailyWorkHours(
    driverId: string,
    date: Date,
  ): Promise<{
    totalHours: number;
    breakHours: number;
    workedHours: number;
    breaks: { start: Date; end: Date }[];
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await this.activityModel
      .find({
        driver: driverId,
        type: {
          $in: [
            ActivityType.CLOCK_IN,
            ActivityType.CLOCK_OUT,
            ActivityType.BREAK_START,
            ActivityType.BREAK_END,
          ],
        },
        timestamp: { $gte: startOfDay, $lte: endOfDay },
      })
      .sort({ timestamp: 1 })
      .exec();

    let totalHours = 0;
    let breakHours = 0;
    const breaks: { start: Date; end: Date }[] = [];

    let clockInTime: Date | null = null;
    let breakStartTime: Date | null = null;

    for (const activity of activities) {
      switch (activity.type) {
        case ActivityType.CLOCK_IN:
          clockInTime = activity.timestamp;
          break;
        case ActivityType.CLOCK_OUT:
          if (clockInTime) {
            totalHours +=
              (activity.timestamp.getTime() - clockInTime.getTime()) /
              (1000 * 60 * 60);
            clockInTime = null;
          }
          break;
        case ActivityType.BREAK_START:
          breakStartTime = activity.timestamp;
          break;
        case ActivityType.BREAK_END:
          if (breakStartTime) {
            const duration =
              (activity.timestamp.getTime() - breakStartTime.getTime()) /
              (1000 * 60 * 60);
            breakHours += duration;
            breaks.push({ start: breakStartTime, end: activity.timestamp });
            breakStartTime = null;
          }
          break;
      }
    }

    const workedHours = totalHours - breakHours;

    return {
      totalHours: Number(totalHours.toFixed(2)),
      breakHours: Number(breakHours.toFixed(2)),
      workedHours: Number(workedHours.toFixed(2)),
      breaks,
    };
  }

  async hasActivityToday(
  driverId: string,
  type: ActivityType,
): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const exists = await this.activityModel.exists({
    driver: driverId,
    type,
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  });

  return !!exists;
}

}
