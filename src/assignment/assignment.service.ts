import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Assignment, AssignmentDocument } from 'src/schemas/assignment.schema';
import { CreateAssignmentDto } from 'src/schemas/create-assignment.dto';
import { UpdateAssignmentDto } from 'src/schemas/update-assignment.dto';
import { User } from 'src/schemas/user.schema';
import { Site, SiteDocument } from 'src/schemas/sites.schema';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async create(dto: CreateAssignmentDto, companyId: string) {
    // ✅ Vérification des chauffeurs
    const validDrivers: Types.ObjectId[] = [];
    if (dto.drivers && dto.drivers.length > 0) {
      for (const driverId of dto.drivers) {
        if (!isValidObjectId(driverId)) {
          throw new BadRequestException(`ID chauffeur invalide : ${driverId}`);
        }
        const driver = (await this.userModel.findById(driverId)) as User;
        if (!driver || driver.role !== UserRole.DRIVER) {
          throw new BadRequestException(`Chauffeur non valide : ${driverId}`);
        }
        validDrivers.push(driver._id as Types.ObjectId);
      }
    }

    // ✅ Vérification des superviseurs
    const validSupervisors: Types.ObjectId[] = [];
    if (dto.supervisors && dto.supervisors.length > 0) {
      for (const supId of dto.supervisors) {
        if (!isValidObjectId(supId)) {
          throw new BadRequestException(`ID superviseur invalide : ${supId}`);
        }
        const supervisor = await this.userModel.findById(supId);
        if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
          throw new BadRequestException(`Superviseur non valide : ${supId}`);
        }
        validSupervisors.push(supervisor._id as Types.ObjectId);
      }
    }

    // ✅ Vérification du site
    if (!isValidObjectId(dto.site)) {
      throw new BadRequestException('ID de site invalide');
    }

    const site = await this.siteModel.findById(dto.site);
    if (!site) {
      throw new BadRequestException('Site introuvable');
    }

    return this.assignmentModel.create({
      drivers: validDrivers,
      supervisors: validSupervisors,
      site: site._id,
      company: companyId,
    });
  }

  async findAll(companyId: Types.ObjectId) {
    return this.assignmentModel
      .find({ company: companyId })
      .populate('drivers', 'firstName lastName email role')
      .populate('supervisors', 'firstName lastName email role')
      .populate('site', 'nom_site adresse_depart adresse_arrivee');
  }

  async findOne(id: string) {
    const assignment = await this.assignmentModel
      .findById(id)
      .populate('drivers', 'firstName lastName email role')
      .populate('supervisors', 'firstName lastName email role')
      .populate('site', 'nom_site adresse_depart adresse_arrivee');

    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    return assignment;
  }

  async findDriversBySupervisor(supervisorId: Types.ObjectId) {
    const assignments = await this.assignmentModel
      .find({ supervisors: supervisorId })
      .populate('drivers', 'firstName lastName email');

    const uniqueDriversMap = new Map();
    for (const assign of assignments) {
      const drivers = assign.drivers as any[];
      drivers.forEach((driver) => {
        if (!uniqueDriversMap.has(driver._id.toString())) {
          uniqueDriversMap.set(driver._id.toString(), driver);
        }
      });
    }

    return Array.from(uniqueDriversMap.values());
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    const updateData: Partial<Assignment> = {};

    // Vérifier chauffeurs
    if (dto.drivers) {
      const validDrivers: Types.ObjectId[] = [];
      for (const driverId of dto.drivers) {
        if (!isValidObjectId(driverId)) {
          throw new BadRequestException(`ID chauffeur invalide : ${driverId}`);
        }
        const driver = await this.userModel.findById(driverId);
        if (!driver || driver.role !== UserRole.DRIVER) {
          throw new BadRequestException(`Chauffeur non valide : ${driverId}`);
        }
        validDrivers.push(driver._id as Types.ObjectId);
      }
      updateData.drivers = validDrivers;
    }

    // Vérifier superviseurs
    if (dto.supervisors) {
      const validSupervisors: Types.ObjectId[] = [];
      for (const supId of dto.supervisors) {
        if (!isValidObjectId(supId)) {
          throw new BadRequestException(`ID superviseur invalide : ${supId}`);
        }
        const supervisor = await this.userModel.findById(supId);
        if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
          throw new BadRequestException(`Superviseur non valide : ${supId}`);
        }
        validSupervisors.push(supervisor._id as Types.ObjectId);
      }
      updateData.supervisors = validSupervisors;
    }

    if (dto.site) {
      if (!isValidObjectId(dto.site)) {
        throw new BadRequestException('ID de site invalide');
      }
      const site = await this.siteModel.findById(dto.site);
      if (!site) {
        throw new BadRequestException('Site introuvable');
      }
      updateData.site = site._id as Types.ObjectId;
    }

    await this.assignmentModel.findByIdAndUpdate(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    return this.assignmentModel.findByIdAndDelete(id);
  }

  async getUnassignedDrivers() {
    const assignedDrivers = await this.assignmentModel.distinct('drivers');
    return this.userModel
      .find({
        role: UserRole.DRIVER,
        _id: { $nin: assignedDrivers },
      })
      .select('firstName lastName email');
  }

  async getUnassignedSupervisors() {
    const assignedSupervisors = await this.assignmentModel.distinct(
      'supervisors',
    );
    return this.userModel
      .find({
        role: UserRole.SUPERVISOR,
        _id: { $nin: assignedSupervisors },
      })
      .select('firstName lastName email');
  }

  // src/assignment/assignment.service.ts
async getCountsBySite(companyId: Types.ObjectId, siteId?: string) {
  const match: any = { company: companyId };

  if (siteId && isValidObjectId(siteId)) {
    match.site = new Types.ObjectId(siteId);
  }

  return this.assignmentModel.aggregate([
    { $match: match },
    {
      $project: {
        site: 1,
        driversCount: { $size: { $ifNull: ['$drivers', []] } },
        supervisorsCount: { $size: { $ifNull: ['$supervisors', []] } },
      },
    },
    {
      $group: {
        _id: '$site',
        driversCount: { $sum: '$driversCount' },
        supervisorsCount: { $sum: '$supervisorsCount' },
      },
    },
    {
      $lookup: {
        from: 'sites',
        localField: '_id',
        foreignField: '_id',
        as: 'site',
      },
    },
    { $unwind: '$site' },
    {
      $project: {
        _id: 0,
        siteId: '$site._id',
        siteName: '$site.nom_site',
        driversCount: 1,
        supervisorsCount: 1,
      },
    },
  ]);
}


}
