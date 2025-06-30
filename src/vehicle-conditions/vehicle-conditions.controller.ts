import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleConditionDto } from 'src/schemas/create-vehicle-conditions.dto';
import { VehicleConditionsService } from './vehicle-conditions.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { VehicleCondition } from 'src/schemas/vehicle-conditions.schema';

ApiTags('vehicle-conditions');
@Controller('vehicle-conditions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VehicleConditionsController {
  constructor(private readonly service: VehicleConditionsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload weekly vehicle condition photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVehicleConditionDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'leftSide', maxCount: 1 },
      { name: 'rightSide', maxCount: 1 },
      { name: 'frontLeftAngle', maxCount: 1 },
      { name: 'frontRightAngle', maxCount: 1 },
      { name: 'frontFace', maxCount: 1 },
      { name: 'rearFace', maxCount: 1 },
      { name: 'interior', maxCount: 1 },
      { name: 'mileage', maxCount: 1 },
    ]),
  )
  async uploadCondition(@CurrentUser() user: any, @UploadedFiles() files: any) {
    return this.service.createConditionFromDriver(user, files);
  }
  @Get('latest')
  @UseGuards(JwtAuthGuard) // Utilisation d'un guard pour authentifier l'utilisateur
  @ApiOperation({
    summary:
      'Get the latest vehicle condition for the current logged-in driver',
  })
  @ApiResponse({
    status: 200,
    description: 'The latest vehicle condition',
    type: VehicleCondition,
  })
  async getLatestCondition(@CurrentUser() req: any) {
    return this.service.getLatestConditionForCurrentUser(req);
  }
}
