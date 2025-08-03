import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { VehiclesModule } from 'src/vehciles/vehciles.module';
import { DocumentEntity, DocumentSchema } from 'src/schemas/document.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    VehiclesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService,MongooseModule],
})
export class ActivitiesModule {}
