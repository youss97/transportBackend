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
}
