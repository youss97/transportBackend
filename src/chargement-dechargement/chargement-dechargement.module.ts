import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChargementDechargementController } from './chargement-dechargement.controller';
import { ChargementDechargementService } from './chargement-dechargement.service';
import { ChargmentDechargementSchemas } from 'src/schemas/chargement-dechargement.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'ChargmentDechargement', schema: ChargmentDechargementSchemas }])],
  controllers: [ChargementDechargementController],
  providers: [ChargementDechargementService],
})
export class ChargementDechargementModule {}
