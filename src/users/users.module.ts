import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { ActivitiesModule } from 'src/activities/activities.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { GazoilModule } from 'src/gazoil/gazoil.module';
import { LeaveModule } from 'src/leave/leave.module';
import { PanneModule } from 'src/panne/panne.module';
import { PointageModule } from 'src/pointage/pointage.module';
import { VehiclesModule } from 'src/vehciles/vehciles.module';
import { ChargementDechargementModule } from 'src/chargement-dechargement/chargement-dechargement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AssignmentModule),
    forwardRef(() => ActivitiesModule),
    forwardRef(() => DocumentsModule),
    forwardRef(() => GazoilModule),
    forwardRef(() => LeaveModule),
    forwardRef(() => PanneModule),
    forwardRef(() => PointageModule),
    forwardRef(() => VehiclesModule),
    forwardRef(() => ChargementDechargementModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, CloudinaryService, CloudinaryProvider],
  exports: [UsersService],
})
export class UsersModule {}
