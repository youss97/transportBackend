import { IsEnum } from 'class-validator';
import { ConditionStatus } from 'src/schemas/vehicle-conditions.schema';

export class UpdateConditionStatusDto {
  @IsEnum(ConditionStatus)
  status: ConditionStatus;
}
