// src/tyre-change/tyre-change.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TyreChangeController } from './tyre-change.controller';
import { TyreChangeService } from './tyre-change.service';
import { TyreChange, TyreChangeSchema } from 'src/schemas/tyre-change.schemas';
import { Vehicle, VehicleSchema } from 'src/schemas/vehicle.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TyreChange.name, schema: TyreChangeSchema },
     { name: User.name, schema: UserSchema },
      { name: Vehicle.name, schema: VehicleSchema },
  ])],
  controllers: [TyreChangeController],
  providers: [TyreChangeService,CloudinaryService],
})
export class TyreChangeModule {}
