import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { Leave, LeaveSchema } from 'src/schemas/leave.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Leave.name, schema: LeaveSchema }])],
  providers: [LeaveService,CloudinaryService],
  controllers: [LeaveController],
  exports: [LeaveService, MongooseModule]
})
export class LeaveModule {}
