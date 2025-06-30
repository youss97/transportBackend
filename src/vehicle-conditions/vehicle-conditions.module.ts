import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { VehicleCondition, VehicleConditionSchema } from 'src/schemas/vehicle-conditions.schema';
import { Vehicle, VehicleSchema } from 'src/schemas/vehicle.schema';
import { VehicleConditionsController } from './vehicle-conditions.controller';
import { VehicleConditionsService } from './vehicle-conditions.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleCondition.name, schema: VehicleConditionSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  controllers: [VehicleConditionsController],
  providers: [VehicleConditionsService, CloudinaryService],
})
export class VehicleConditionsModule {}