import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePanneDto } from 'src/schemas/create-panne.dto';
import { Panne } from 'src/schemas/panne.schema';

@Injectable()
export class PanneService {
  constructor(@InjectModel(Panne.name) private panneModel: Model<Panne>) {}
  async create(
    dto: CreatePanneDto,
    companyId: string,
    userId: string,
    photoUrls: string[],
  ) {
    return this.panneModel.create({
      ...dto,
      datePanne: new Date(dto.datePanne),
      companyId: new Types.ObjectId(companyId),
      userId: new Types.ObjectId(userId),
      photoUrls,
    });
  }
  async findByCompanyId(companyId: string) {
    return this.panneModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    return this.panneModel.findById(id);
  }
}
