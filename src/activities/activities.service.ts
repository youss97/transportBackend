import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityType } from 'src/enums/activity-type.enum';
import { GeneralActivityType } from 'src/enums/general-activity.enum';
import { Activity } from 'src/schemas/activity.schema';
import { CreateActivityDto } from 'src/schemas/create-activity.dto';
import { DocumentEntity } from 'src/schemas/document.schema';
import { VehiclesService } from 'src/vehciles/vehciles.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(DocumentEntity.name)
    private documentModel: Model<DocumentEntity>,

    private vehiclesService: VehiclesService,
  ) {}

  async create(
    userId: string, // ID du conducteur
    createActivityDto: CreateActivityDto, // DTO de l'activité
    companyId: string, // ID de la société
  ): Promise<Activity> {
    // Trouver le véhicule en fonction du conducteur
    const vehicle = await this.vehiclesService.findOneByDriver(userId); // Recherche du véhicule associé au conducteur

    if (!vehicle) {
      throw new NotFoundException('Aucun véhicule trouvé pour ce conducteur');
    }

    // Créer l'activité
    const activity = new this.activityModel({
      ...createActivityDto,
      driver: userId,
      company: companyId,
      vehicle: vehicle._id,
    });

    const savedActivity = await activity.save();

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

async findActivitiesWithDocuments(
  driverId: string,
  limit = 50,
  page = 1,
  search = '',
): Promise<{
  data: Record<
    GeneralActivityType,
    {
      date: string;
      activities: {
        activity: any;
        documents: any[];
        generalType: GeneralActivityType;
      }[];
    }[]
  >;
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  const query: any = { driver: driverId };

  if (search) {
    query.$or = [
      { type: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
    ];
  }

  const [activities, total] = await Promise.all([
    this.activityModel
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: 'driver', select: 'firstName lastName' },
        { path: 'vehicle', select: 'licensePlate' },
      ])
      .exec(),
    this.activityModel.countDocuments(query),
  ]);

  // Structure finale
  const groupedByGeneralType: Record<GeneralActivityType, Record<string, any[]>> = {
    [GeneralActivityType.ATTENDANCE]: {},
    [GeneralActivityType.LOADING]: {},
  };

  for (const activity of activities) {
    console.log(activity)
    const documents = await this.documentModel
      .findOne({ activity: String(activity._id) })
      .sort({ createdAt: -1 })
      .exec();
      console.log(documents);
    const generalType = this.mapToGeneralActivityType(activity.type);
    const activityDate = new Date(activity.timestamp).toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const structured = {
      activity,
      documents,
      generalType,
    };

    if (!groupedByGeneralType[generalType][activityDate]) {
      groupedByGeneralType[generalType][activityDate] = [];
    }

    groupedByGeneralType[generalType][activityDate].push(structured);
  }

  // Convert to desired output format
  const data: Record<
    GeneralActivityType,
    {
      date: string;
      activities: {
        activity: any;
        documents: any[];
        generalType: GeneralActivityType;
      }[];
    }[]
  > = {
    [GeneralActivityType.ATTENDANCE]: [],
    [GeneralActivityType.LOADING]: [],
  };

  for (const type of Object.values(GeneralActivityType)) {
    const dateGroups = groupedByGeneralType[type];
    const sortedDates = Object.keys(dateGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (const date of sortedDates) {
      const activities = dateGroups[date].sort((a, b) =>
        new Date(a.activity.timestamp).getTime() - new Date(b.activity.timestamp).getTime(),
      );

      data[type].push({ date, activities });
    }
  }
  return {
    data,
    total,
    page,
    limit,
  };
}


  mapToGeneralActivityType(type: string): GeneralActivityType {
    const attendanceTypes = [
      ActivityType.CLOCK_IN,
       ActivityType.CLOCK_OUT,
     ActivityType.BREAK_START,
     ActivityType.BREAK_END,
    ];
    const loadingTypes = [ActivityType.LOADING, ActivityType.UNLOADING ];

    if (attendanceTypes.includes(type as ActivityType)) return GeneralActivityType.ATTENDANCE;
    if (loadingTypes.includes(type as ActivityType)) return GeneralActivityType.LOADING;

  }
  async findActivitiesWithDocumentsForCompany(
    companyId: string,
    limit = 50,
    page = 1,
    search = '',
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const query: any = { company: companyId };

    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
      ];
    }

    const [activities, total] = await Promise.all([
      this.activityModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'driver', select: 'firstName lastName' },
          { path: 'vehicle', select: 'licensePlate' },
        ])
        .exec(),
      this.activityModel.countDocuments(query),
    ]);

    const data = await Promise.all(
      activities.map(async (activity) => {
        const documents = await this.documentModel
          .find({ activity: activity._id })
          .exec();
        return { activity, documents };
      }),
    );

    return { data, total, page, limit };
  }
}
