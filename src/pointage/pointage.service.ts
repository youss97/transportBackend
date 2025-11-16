import { PartialType } from '@nestjs/mapped-types';

// pointage/pointage.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Pointage, PointageDocument } from 'src/schemas/pointage.schema';
import { CreatePointageDto } from 'src/schemas/create-pointage.dto';
import { UpdatePointageDto } from 'src/schemas/update-pointage.dto';
import * as moment from 'moment';
import { CompanySettings } from 'src/schemas/company-settings.schema';

@Injectable()
export class PointageService {
  constructor(
    @InjectModel(Pointage.name) private pointageModel: Model<PointageDocument>,
    @InjectModel(CompanySettings.name)
    private companySettingsModel: Model<CompanySettings>,
  ) {}

  async create(
    createPointageDto: CreatePointageDto,
    userId: string,
    companyId: string,
  ): Promise<Pointage> {
    const newPointage = new this.pointageModel({
      ...createPointageDto,
      driver: new Types.ObjectId(userId),
      company: new Types.ObjectId(companyId),
    });
    return newPointage.save();
  }

  async findAllByUserId(userId: string): Promise<Pointage[]> {
    return this.pointageModel
      .find({
        driver: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .populate('driver') // Peupler la clé étrangère 'driver' avec les informations associées
      .populate('company')
      .exec();
  }

  async findAll(): Promise<Pointage[]> {
    return this.pointageModel
      .find()
      .sort({ createdAt: -1 }) // Tri par date de création
      .populate('driver') // Peupler la clé étrangère 'driver' avec les informations associées
      .populate('company') // Peupler la clé étrangère 'company' avec les informations associées
      .exec();
  }
  async findAllByCompanyId(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Pointage[]> {
    const filter: any = {
      company: new Types.ObjectId(companyId),
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.pointageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('driver', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Pointage> {
    const pointage = await this.pointageModel
      .findOne({
        _id: new Types.ObjectId(id),
        driver: new Types.ObjectId(userId),
      })
      .exec();

    if (!pointage) {
      throw new NotFoundException('Pointage not found');
    }

    return pointage;
  }

  async update(
    id: string,
    updatePointageDto: UpdatePointageDto,
    userId: string,
  ): Promise<Pointage> {
    // On supprime tous les champs undefined pour éviter d'écraser les valeurs existantes
    const cleanDto = Object.fromEntries(
      Object.entries(updatePointageDto).filter(([_, v]) => v !== undefined),
    );

    const updatedPointage = await this.pointageModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        driver: new Types.ObjectId(userId),
      },
      { $set: cleanDto }, // On ne met à jour que les champs envoyés
      { new: true }, // Retourne le document après update
    );

    if (!updatedPointage) {
      throw new NotFoundException('Pointage not found');
    }

    return updatedPointage;
  }

  async uploadPhoto(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `pointage/${folder}`,
          resource_type: 'auto',
        },
      );
      return result.secure_url;
    } catch (error) {
      throw new BadRequestException('Failed to upload photo');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.pointageModel
      .deleteOne({
        _id: new Types.ObjectId(id),
      })
      .exec();

    if (!result) {
      throw new NotFoundException('Pointage not found');
    }
  }

  async findTodayPointage(userId: string): Promise<Pointage | null> {
    const todayStart = moment().utc().startOf('day').toDate();
    const todayEnd = moment().utc().endOf('day').toDate();

    return this.pointageModel
      .findOne({
        driver: new Types.ObjectId(userId),
        createdAt: { $gte: todayStart, $lte: todayEnd },
      })
      .exec();
  }
  async getMonthlyReportByDriver(
    userId: string,
    companyId: string,
    year: number,
    month: number,
    siteId?: string, // ✅ optionnel
  ) {
    // Récupérer les paramètres de la société
    const companySettings = await this.companySettingsModel
      .findOne({ companyId })
      .exec();
    if (!companySettings) {
      throw new NotFoundException('Paramètres de la société introuvables');
    }

    const { workStartHour, workEndHour, totalBreakHours } = companySettings;

    const monthStart = moment
      .utc({ year, month: month - 1, day: 1 })
      .startOf('day')
      .toDate();
    const monthEnd = moment
      .utc({ year, month: month - 1 })
      .endOf('month')
      .endOf('day')
      .toDate();

    // ✅ Construire le filtre
    const filter: any = {
      driver: new Types.ObjectId(userId),
      createdAt: { $gte: monthStart, $lte: monthEnd },
    };

    if (siteId) {
      filter.site = new Types.ObjectId(siteId); // ✅ Filtrer par site si présent
    }

    const pointages = await this.pointageModel
      .find(filter)
      .sort({ createdAt: 1 })
      .exec();

    const daysInMonth = moment(monthStart).daysInMonth();
    const report = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = moment
        .utc({ year, month: month - 1, day })
        .startOf('day');

      const pointage = pointages.find((p) =>
        moment(p.createdAt).utc().isSame(currentDate, 'day'),
      );

      if (pointage) {
        const isLate =
          pointage.pointageDebut &&
          moment(pointage.pointageDebut).isAfter(
            moment(currentDate).set({
              hour: parseInt(workStartHour.split(':')[0], 10),
              minute: parseInt(workStartHour.split(':')[1], 10),
            }),
          );

        const isAbsent = !pointage.pointageDebut;

        report.push({
          date: currentDate.format('YYYY-MM-DD'),
          heureDebut: pointage.pointageDebut
            ? moment(pointage.pointageDebut).format('HH:mm')
            : null,
          heureFin: pointage.pointageFin
            ? moment(pointage.pointageFin).format('HH:mm')
            : null,
          absence: isAbsent,
          retard: !isAbsent && isLate,
          tempsTravail:
            pointage.pointageDebut && pointage.pointageFin
              ? moment(pointage.pointageFin).diff(
                  moment(pointage.pointageDebut),
                  'hours',
                  true,
                ) - (totalBreakHours || 0)
              : 0,
        });
      } else {
        report.push({
          date: currentDate.format('YYYY-MM-DD'),
          heureDebut: null,
          heureFin: null,
          absence: true,
          retard: false,
          tempsTravail: 0,
        });
      }
    }

    return report;
  }
}
