import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesController } from './vehciles.controller';
import { VehiclesService } from './vehciles.service';
import { Vehicle, VehicleSchema } from 'src/schemas/vehicle.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService,CloudinaryService],
  exports: [VehiclesService],
})
export class VehiclesModule {}