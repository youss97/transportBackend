import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleConditionDto } from 'src/schemas/create-vehicle-conditions.dto';
import { VehicleConditionsService } from './vehicle-conditions.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ConditionStatus, VehicleCondition } from 'src/schemas/vehicle-conditions.schema';
import { UpdateConditionStatusDto } from 'src/schemas/update-conditions-status.dto';

@ApiTags('vehicle-conditions')
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change the status of the vehicle condition' })
  @ApiResponse({
    status: 200,
    description: 'The vehicle condition status was updated.',
  })
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateConditionStatusDto,
  ) {
    return this.service.changeStatus(id, dto.status);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Validate the vehicle condition' })
  async validateCondition(@Param('id') id: string) {
    return this.service.changeStatus(id, ConditionStatus.VALIDATED);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject the vehicle condition' })
  async rejectCondition(@Param('id') id: string) {
    return this.service.changeStatus(id, ConditionStatus.REJECTED);
  }
}
