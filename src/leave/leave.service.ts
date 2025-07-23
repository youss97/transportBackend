import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLeaveDto, UpdateLeaveStatusDto } from 'src/schemas/leave.dto';
import { Leave, LeaveStatus, LeaveType } from 'src/schemas/leave.schema';


@Injectable()
export class LeaveService {
  constructor(@InjectModel(Leave.name) private leaveModel: Model<Leave>) {}

async create(
  userId: Types.ObjectId,
  companyId: Types.ObjectId,
  dto: CreateLeaveDto,
  medicalFileUrl?: string,
) {
  if (dto.type === LeaveType.SICK && !medicalFileUrl) {
    throw new ForbiddenException('Le certificat médical est requis pour un arrêt maladie.');
  }

  return this.leaveModel.create({
    ...dto,
    user: userId,
    companyId,
    medicalFileUrl,
  });
}


async findByUser(userId: Types.ObjectId, companyId: Types.ObjectId) {
  return this.leaveModel.find({ user: userId, companyId }).sort({ createdAt: -1 });
}

async findPendingLeaves(companyId: Types.ObjectId) {
  return this.leaveModel
    .find({ status: LeaveStatus.PENDING, companyId })
    .populate('user');
}

  async validateLeave(id: string, dto: UpdateLeaveStatusDto): Promise<Leave> {
    const leave = await this.leaveModel.findById(id);
    if (!leave) {
      throw new NotFoundException('Congé non trouvé');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Seuls les congés en attente peuvent être validés ou refusés');
    }

    if (![LeaveStatus.APPROVED, LeaveStatus.REJECTED].includes(dto.status)) {
      throw new BadRequestException('Statut invalide. Utilisez APPROVED ou REJECTED.');
    }

    leave.status = dto.status;
    await leave.save();

    return leave;
  }
}
