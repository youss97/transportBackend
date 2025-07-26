import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { UserRole } from 'src/enums/user-role.enum';
import { Assignment, AssignmentDocument } from 'src/schemas/assignment.schema';
import { CreateAssignmentDto } from 'src/schemas/create-assignment.dto';
import { Site, SiteDocument } from 'src/schemas/sites.schema';
import { UpdateAssignmentDto } from 'src/schemas/update-assignment.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

 async create(dto: CreateAssignmentDto, companyId: string) {


  // ✅ Vérification chauffeur (si défini et non vide)
  if (dto.driver && dto.driver.trim() !== '') {
    if (!isValidObjectId(dto.driver)) {
      throw new BadRequestException('Identifiant du chauffeur invalide');
    }
    const driver = await this.userModel.findById(dto.driver);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new BadRequestException('Le chauffeur est invalide ou non autorisé');
    }
  } else {
    dto.driver = undefined;
  }

  // ✅ Vérification superviseur (si défini et non vide)
  if (dto.supervisor && dto.supervisor.trim() !== '') {
    if (!isValidObjectId(dto.supervisor)) {
      throw new BadRequestException('Identifiant du superviseur invalide');
    }
    const supervisor = await this.userModel.findById(dto.supervisor);
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException('Le superviseur est invalide ou non autorisé');
    }
  } else {
    dto.supervisor = undefined;
  }

  // ✅ Vérification site (si défini et non vide)
  if (dto.site && dto.site.trim() !== '') {
    if (!isValidObjectId(dto.site)) {
      throw new BadRequestException('Identifiant du site invalide');
    }
    const site = await this.siteModel.findById(dto.site);
    if (!site) {
      throw new BadRequestException('Le site spécifié est introuvable');
    }
  } else {
    dto.site = undefined;
  }

  // ✅ Création de l'affectation
  return this.assignmentModel.create({
    ...dto,
    company: companyId,
  });
}

  async findAll(companyId: Types.ObjectId) {
    return this.assignmentModel
      .find({ company: companyId })
      .populate('driver', 'firstName lastName email role')
      .populate('supervisor', 'firstName lastName email role')
      .populate('site', 'nom_site adresse_depart adresse_arrivee')
      .populate('company');
  }

  async findOne(id: string) {
    const assignment = await this.assignmentModel
      .findById(id)
      .populate('driver', 'firstName lastName email role')
      .populate('supervisor', 'firstName lastName email role')
      .populate('site', 'nom_site adresse_depart adresse_arrivee')
      .populate('company');

    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    return assignment;
  }

  async findDriversBySupervisor(supervisorId: Types.ObjectId) {
    const assignments = await this.assignmentModel
      .find({ supervisor: supervisorId })
      .populate('driver', 'firstName lastName email');

    // Extraire les chauffeurs uniques
    const uniqueDriversMap = new Map();

    for (const assign of assignments) {
      const driver = assign.driver as any;
      if (!uniqueDriversMap.has(driver._id.toString())) {
        uniqueDriversMap.set(driver._id.toString(), driver);
      }
    }

    return Array.from(uniqueDriversMap.values());
  }

async update(id: string, dto: UpdateAssignmentDto) {
  const assignment = await this.assignmentModel.findById(id);
  if (!assignment) {
    throw new NotFoundException('Affectation non trouvée');
  }

  // ✅ Chauffeur
  if (dto.driver && dto.driver.trim() !== '') {
    if (!isValidObjectId(dto.driver)) {
      throw new BadRequestException('Identifiant du chauffeur invalide');
    }
    const driver = await this.userModel.findById(dto.driver);
    if (!driver || driver.role !== UserRole.DRIVER) {
      throw new BadRequestException('Le nouveau chauffeur est invalide');
    }
  } else {
    dto.driver = undefined;
  }

  // ✅ Superviseur
  if (dto.supervisor && dto.supervisor.trim() !== '') {
    if (!isValidObjectId(dto.supervisor)) {
      throw new BadRequestException('Identifiant du superviseur invalide');
    }
    const supervisor = await this.userModel.findById(dto.supervisor);
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException('Le nouveau superviseur est invalide');
    }
  } else {
    dto.supervisor = undefined;
  }

  // ✅ Site
  if (dto.site && dto.site.trim() !== '') {
    if (!isValidObjectId(dto.site)) {
      throw new BadRequestException('Identifiant du site invalide');
    }
    const site = await this.siteModel.findById(dto.site);
    if (!site) {
      throw new BadRequestException('Le nouveau site est introuvable');
    }
  } else {
    dto.site = undefined;
  }

  await this.assignmentModel.findByIdAndUpdate(id, dto);
  return this.findOne(id); // retourne la version mise à jour avec populate
}

  async remove(id: string) {
    const assignment = await this.assignmentModel.findById(id);
    if (!assignment) {
      throw new NotFoundException('Affectation non trouvée');
    }

    return this.assignmentModel.findByIdAndDelete(id);
  }

  async getUnassignedDrivers() {
    const assignedDrivers = await this.assignmentModel.distinct('driver');
    return this.userModel
      .find({
        role: UserRole.DRIVER,
        _id: { $nin: assignedDrivers },
      })
      .select('firstName lastName email');
  }

  async getUnassignedSupervisors() {
    const assignedSupervisors = await this.assignmentModel.distinct(
      'supervisor',
    );
    return this.userModel
      .find({
        role: UserRole.SUPERVISOR,
        _id: { $nin: assignedSupervisors },
      })
      .select('firstName lastName email');
  }
}
