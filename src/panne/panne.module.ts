import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PanneController } from './panne.controller';
import { PanneService } from './panne.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Panne, PanneSchema } from 'src/schemas/panne.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: Panne.name, schema: PanneSchema }])],
  controllers: [PanneController],
  providers: [PanneService, CloudinaryService],
})
export class PanneModule {}
