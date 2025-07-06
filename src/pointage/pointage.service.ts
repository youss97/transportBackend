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

@Injectable()
export class PointageService {
  constructor(
    @InjectModel(Pointage.name) private pointageModel: Model<PointageDocument>,
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
  async findAllByCompanyId(companyId: string): Promise<Pointage[]> {
    return this.pointageModel
      .find({
        company: new Types.ObjectId(companyId),
      })
      .sort({ createdAt: -1 })
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
    const updatedPointage = await this.pointageModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          driver: new Types.ObjectId(userId),
        },
        updatePointageDto,
      )
      .exec();

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
}
