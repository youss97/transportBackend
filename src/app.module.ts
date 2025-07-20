import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehciles/vehciles.module';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { ReportsModule } from './reports/reports.module';
import { CompaniesModule } from './companies/companies.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { PointageModule } from './pointage/pointage.module';
import { ChargementDechargementModule } from './chargement-dechargement/chargement-dechargement.module';
import { VehicleConditionsModule } from './vehicle-conditions/vehicle-conditions.module';
import { SitesModule } from './sites/sites.module';
import { AssignmentModule } from './assignment/assignment.module';
import { LeaveModule } from './leave/leave.module';
import { GazoilModule } from './gazoil/gazoil.module';

@Module({
  imports: [
    UsersModule,
    VehiclesModule,
    ActivitiesModule,
    AuthModule,
    DocumentsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI,
    ),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    ReportsModule,

    CompaniesModule,

    CompanySettingsModule,

    PointageModule,

    ChargementDechargementModule,

    VehicleConditionsModule,

    SitesModule,

    AssignmentModule,

    LeaveModule,
    GazoilModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
