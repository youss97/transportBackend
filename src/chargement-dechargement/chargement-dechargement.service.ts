import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import {
  ChargmentDechargement,
  ChargmentDechargementDocument,
} from 'src/schemas/chargement-dechargement.schema';
import { CreateChargementDechargementDto } from 'src/schemas/create-chargement-dechargement.dto';
import { UpdateChargementDechargementDto } from 'src/schemas/update-chargement-dechargement.dto';
import * as moment from 'moment';
import { PassThrough } from 'stream';

@Injectable()
export class ChargementDechargementService {
  constructor(
    @InjectModel(ChargmentDechargement.name)
    private chargementDechargementModel: Model<ChargmentDechargementDocument>,
  ) {}

  async create(
    createDto: CreateChargementDechargementDto,
    userId: string,
    companyId: string,
  ): Promise<ChargmentDechargement> {
    const newChargementDechargement = new this.chargementDechargementModel({
      ...createDto,
      driver: new Types.ObjectId(userId),
      company: new Types.ObjectId(companyId),
    });
    return newChargementDechargement.save();
  }

  async findAllByUserId(userId: string): Promise<ChargmentDechargement[]> {
    return this.chargementDechargementModel
      .find({ driver: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }
  async findAll(): Promise<ChargmentDechargement[]> {
    return this.chargementDechargementModel
      .find()
      .sort({ createdAt: -1 }) // Tri par date de création
      .populate('driver') // Peupler la clé étrangère 'driver' avec les informations associées
      .populate('company') // Peupler la clé étrangère 'company' avec les informations associées
      .exec();
  }
  async findAllByCompanyId(
    companyId: string,
  ): Promise<ChargmentDechargement[]> {
    return this.chargementDechargementModel
      .find({ company: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<ChargmentDechargement> {
    const chargementDechargement = await this.chargementDechargementModel
      .findOne({
        _id: new Types.ObjectId(id),
        driver: new Types.ObjectId(userId),
      })
      .exec();

    if (!chargementDechargement) {
      throw new NotFoundException('Chargement/Dechargement not found');
    }

    return chargementDechargement;
  }

  async update(
    id: string,
    updateDto: UpdateChargementDechargementDto,
    userId: string,
  ): Promise<ChargmentDechargement> {
    const updatedChargementDechargement = await this.chargementDechargementModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), driver: new Types.ObjectId(userId) },
        updateDto,
        { new: true },
      )
      .exec();

    if (!updatedChargementDechargement) {
      throw new NotFoundException('Chargement/Dechargement not found');
    }

    return updatedChargementDechargement;
  }

  async uploadPhoto(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      return await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `chargement-dechargement/${folder}`,
            resource_type: 'auto',
          },
          (error, result: UploadApiResponse) => {
            if (error || !result) {
              return reject(new BadRequestException('Failed to upload photo'));
            }
            resolve(result.secure_url);
          },
        );

        const bufferStream = new PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    } catch (error) {
      throw new BadRequestException('Failed to upload photo');
    }
  }
  async remove(id: string): Promise<void> {
    const result = await this.chargementDechargementModel
      .deleteOne({ _id: new Types.ObjectId(id) })
      .exec();

    if (!result.deletedCount) {
      throw new NotFoundException('Chargement/Dechargement not found');
    }
  }
  async findTodayChargementDechargement(
    userId: string,
  ): Promise<ChargmentDechargement | null> {
    const todayStart = moment().utc().startOf('day').toDate();
    const todayEnd = moment().utc().endOf('day').toDate();

    return this.chargementDechargementModel
      .findOne({
        driver: new Types.ObjectId(userId),
        createdAt: { $gte: todayStart, $lte: todayEnd },
      })
      .exec();
  }

  async getStatsByDriver(driverId: string) {
    return this.chargementDechargementModel.aggregate([
      { $match: { driver: new Types.ObjectId(driverId) } },
      {
        $group: {
          _id: '$driver',
          totalOperations: { $sum: 1 },
          totalTonnage: { $sum: '$tonnage' },
        },
      },
    ]);
  }
  async getStatsByCompany(companyId: string) {
    return this.chargementDechargementModel.aggregate([
      { $match: { company: new Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$driver',
          totalOperations: { $sum: 1 },
          totalTonnage: { $sum: '$tonnage' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driver',
        },
      },
      { $unwind: '$driver' },
    ]);
  }

  async getMonthlyStatsByCompany(
    companyId: string,
    year: number,
    month: number,
  ) {
    return this.chargementDechargementModel.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          createdAt: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        },
      },
      {
        $group: {
          _id: '$driver',
          totalOperations: { $sum: 1 },
          totalTonnage: { $sum: '$tonnage' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driver',
        },
      },
      { $unwind: '$driver' },
      {
        $project: {
          driver: 1,
          totalOperations: 1,
          totalTonnage: 1,
        },
      },
      { $sort: { 'driver.name': 1 } },
    ]);
  }
  async getMonthlyStatsByCompanyByDriverByMonth(
    companyId: string,
    year: number,
    month: number,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.chargementDechargementModel.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      // Récupérer le site correspondant au trajet du chargement
      {
        $lookup: {
          from: 'sites',
          let: { driverId: '$driver' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$company', new Types.ObjectId(companyId)] },
              },
            },
            // Ici on pourrait filtrer par adresse_depart/arrivee si nécessaire
          ],
          as: 'siteInfo',
        },
      },
      { $unwind: '$siteInfo' },
      // Calculer le chiffre d’affaires en utilisant prix_tonne du site
      {
        $addFields: {
          chiffreAffaire: { $multiply: ['$tonnage', '$siteInfo.prix_tonne'] },
        },
      },
      // Grouper par chauffeur
      {
        $group: {
          _id: '$driver',
          totalChiffreAffaire: { $sum: '$chiffreAffaire' },
          joursTravail: {
            $addToSet: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
          totalOperations: { $sum: 1 },
          totalTonnage: { $sum: '$tonnage' },
        },
      },
      {
        $addFields: {
          nombreJoursTravail: { $size: '$joursTravail' },
          // Absences: si tu veux calculer dynamiquement, tu peux remplacer 22 par le nombre de jours ouvrés du mois
          nombreAbsences: { $subtract: [22, { $size: '$joursTravail' }] },
        },
      },
      // Récupérer les infos du chauffeur
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      { $unwind: '$driverInfo' },
      {
        $project: {
          _id: 0,
          driverId: '$driverInfo._id',
          driverName: '$driverInfo.name',
          totalChiffreAffaire: 1,
          nombreJoursTravail: 1,
          nombreAbsences: 1,
          totalOperations: 1,
          totalTonnage: 1,
        },
      },
    ]);
  }

  async getRevenueByMonth(
    companyId: string,
    year: number,
    month: number,
    siteId?: string,
    day?: string,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const match: any = {
      company: new Types.ObjectId(companyId),
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (day) {
      const dayStart = new Date(day + 'T00:00:00');
      const dayEnd = new Date(day + 'T23:59:59');
      match.createdAt = { $gte: dayStart, $lte: dayEnd };
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'sites',
          localField: 'company',
          foreignField: 'company',
          as: 'sites',
        },
      },
      { $unwind: '$sites' },
    ];

    if (siteId) {
      pipeline.push({ $match: { 'sites._id': new Types.ObjectId(siteId) } });
    }

    pipeline.push(
      {
        $addFields: {
          chiffreAffaire: { $multiply: ['$tonnage', '$sites.prix_tonne'] },
          siteName: '$sites.nom_site',
          siteId: '$sites._id',
          jour: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: { siteId: '$siteId', jour: '$jour' },
          siteName: { $first: '$siteName' },
          totalChiffreAffaire: { $sum: '$chiffreAffaire' },
          totalTonnage: { $sum: '$tonnage' },
          totalOperations: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          siteId: '$_id.siteId',
          siteName: 1,
          jour: '$_id.jour',
          totalChiffreAffaire: 1,
          totalTonnage: 1,
          totalOperations: 1,
        },
      },
    );

    return this.chargementDechargementModel.aggregate(pipeline);
  }

  async getProductionByMonth(
    companyId: string,
    year: number,
    month: number,
    siteId?: string,
    day?: string, // nouveau paramètre
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const match: any = {
      company: new Types.ObjectId(companyId),
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (day) {
      const dayStart = new Date(day + 'T00:00:00');
      const dayEnd = new Date(day + 'T23:59:59');
      match.createdAt = { $gte: dayStart, $lte: dayEnd };
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'sites',
          localField: 'company',
          foreignField: 'company',
          as: 'sites',
        },
      },
      { $unwind: '$sites' },
    ];

    if (siteId) {
      pipeline.push({
        $match: { 'sites._id': new Types.ObjectId(siteId) },
      });
    }

    pipeline.push(
      {
        $addFields: {
          jour: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: { siteId: '$sites._id', jour: '$jour' },
          siteName: { $first: '$sites.nom_site' },
          totalTonnage: { $sum: '$tonnage' },
          totalOperations: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          siteId: '$_id.siteId',
          siteName: 1,
          jour: '$_id.jour',
          totalTonnage: 1,
          totalOperations: 1,
        },
      },
    );

    return this.chargementDechargementModel.aggregate(pipeline);
  }
  async getRankingBySiteAndMonth(
    companyId: string,
    year: number,
    month: number,
    siteId?: string,
    day?: string,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const match: any = {
      company: new Types.ObjectId(companyId),
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (day) {
      const dayStart = new Date(day + 'T00:00:00');
      const dayEnd = new Date(day + 'T23:59:59');
      match.createdAt = { $gte: dayStart, $lte: dayEnd };
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'sites',
          localField: 'company',
          foreignField: 'company',
          as: 'siteInfo',
        },
      },
      { $unwind: '$siteInfo' },
    ];

    if (siteId) {
      pipeline.push({ $match: { 'siteInfo._id': new Types.ObjectId(siteId) } });
    }

    pipeline.push(
      {
        $addFields: {
          chiffreAffaire: { $multiply: ['$tonnage', '$siteInfo.prix_tonne'] },
          jour: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: '$driver',
          totalTonnage: { $sum: '$tonnage' },
          totalOperations: { $sum: 1 },
          totalChiffreAffaire: { $sum: '$chiffreAffaire' },
          joursTravail: { $addToSet: '$jour' },
        },
      },
      {
        $addFields: {
          nombreJoursTravail: { $size: '$joursTravail' },
          nombreAbsences: { $subtract: [22, { $size: '$joursTravail' }] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'driverInfo',
        },
      },
      { $unwind: '$driverInfo' },
      {
        $project: {
          _id: 0,
          driverId: '$driverInfo._id',
          nom: '$driverInfo.lastName',
          prenom: '$driverInfo.firstName',
          totalTonnage: 1,
          totalOperations: 1,
          totalChiffreAffaire: 1,
          nombreJoursTravail: 1,
          nombreAbsences: 1,
          joursTravail: 1,
        },
      },
      { $sort: { totalChiffreAffaire: -1 } },
    );

    return this.chargementDechargementModel.aggregate(pipeline);
  }
}
