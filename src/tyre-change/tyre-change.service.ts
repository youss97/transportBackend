// src/tyre-change/tyre-change.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTyreChangeDto } from 'src/schemas/create-tyre-change.dto';
import { TyreChange } from 'src/schemas/tyre-change.schemas';


@Injectable()
export class TyreChangeService {
  constructor(
    @InjectModel(TyreChange.name) private tyreChangeModel: Model<TyreChange>,
  ) {}

  async create(dto: CreateTyreChangeDto) {
    const created = new this.tyreChangeModel(dto);
    return created.save();
  }

  async findAll() {
    return this.tyreChangeModel
      .find()
      .populate('driverId vehicleId');
  }

  async findByVehicle(vehicleId: string) {
    return this.tyreChangeModel
      .find({ vehicleId })
      .populate('driverId vehicleId');
  }
}
