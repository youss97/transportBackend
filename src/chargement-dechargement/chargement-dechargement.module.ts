import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChargementDechargementController } from './chargement-dechargement.controller';
import { ChargementDechargementService } from './chargement-dechargement.service';
import { ChargmentDechargement, ChargmentDechargementSchemas } from 'src/schemas/chargement-dechargement.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChargmentDechargement.name, schema: ChargmentDechargementSchemas }])],
  controllers: [ChargementDechargementController],
  providers: [ChargementDechargementService],
  exports :[ChargementDechargementService, MongooseModule]
})
export class ChargementDechargementModule {}
