import { MongoClient, ObjectId } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const PASSWORD = 'Admin@1234';
const HASHED = bcrypt.hashSync(PASSWORD, 12);

const DEFAULT_PHOTO = 'https://res.cloudinary.com/dy1fxxlup/image/upload/v1739111111/default-user.webp';
const DEFAULT_LOGO = 'https://res.cloudinary.com/dy1fxxlup/image/upload/v1739111111/default-company.png';
const TRUCK_PHOTO = 'https://res.cloudinary.com/dy1fxxlup/image/upload/v1739111111/truck-demo.jpg';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI manquant !');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  console.log('Démarrage de la seed complète (idempotente)...');

  // Collections
  const companies = db.collection('companies');
  const users = db.collection('users');
  const vehicles = db.collection('vehicles');
  const sites = db.collection('sites');
  const assignments = db.collection('assignments');
  const companySettings = db.collection('companysettings');
  const activities = db.collection('activities');
  const pointages = db.collection('pointages');
  const chargments = db.collection('chargementdechargements');

  // 1. Société
  let company = await companies.findOne({ slug: 'societe-demo' });
  let companyId: ObjectId;

  if (!company) {
    companyId = new ObjectId();
    await companies.insertOne({
      _id: companyId,
      name: 'TransMine Tunisia',
      slug: 'societe-demo',
      logo: DEFAULT_LOGO,
      address: 'Zone Industrielle Mégrine, Tunis',
      phone: '+216 71 123 456',
      email: 'contact@transmine.tn',
      website: 'https://transmine.tn',
      isActive: true,
      maxUsers: 500,
      maxVehicles: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Société créée');
  } else {
    companyId = company._id;
    console.log('Société déjà existante');
  }

  // Helper : créer utilisateur si inexistant
  const createUser = async (data: any) => {
    const exists = await users.findOne({ email: data.email });
    if (exists) {
      console.log(`Utilisateur déjà existant : ${data.email}`);
      return exists._id as ObjectId;
    }
    const id = new ObjectId();
    await users.insertOne({ _id: id, ...data, password: HASHED, photo: DEFAULT_PHOTO, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    console.log(`Utilisateur créé : ${data.email} (${data.role})`);
    return id;
  };

  // 2. Super Admin
  const superAdminId = await createUser({
    firstName: 'Super', lastName: 'Admin', email: 'super@transmine.tn', role: 'super_administrateur', company: null
  });

  // 3. Admin société
  const adminId = await createUser({
    firstName: 'Ahmed', lastName: 'Ben Ali', email: 'admin@transmine.tn', role: 'responsable_administratif', company: companyId, phone: '+216 98 111 222'
  });

  // 4. Superviseur
  const supervisorId = await createUser({
    firstName: 'Karim', lastName: 'Jlassi', email: 'superviseur@transmine.tn', role: 'superviseur', company: companyId, phone: '+216 55 333 444'
  });

  // 5. Chauffeur
  const driverId = await createUser({
    firstName: 'Mohamed', lastName: 'Trabelsi', email: 'm.trabelsi@transmine.tn', role: 'chauffeur', company: companyId,
    phone: '+216 22 555 666', licenseNumber: 'TN88775544', licenseExpirationDate: new Date('2027-08-15')
  });

  // 6. Véhicules
  const createVehicleIfNotExists = async (plate: string, data: any) => {
    const exists = await vehicles.findOne({ licensePlate: plate });
    if (exists) return exists._id as ObjectId;
    const id = new ObjectId();
    await vehicles.insertOne({ _id: id, company: companyId, currentDrivers: [driverId], isActive: true, status: 'disponible', ...data, createdAt: new Date(), updatedAt: new Date() });
    console.log(`Véhicule créé : ${plate}`);
    return id;
  };

  const vehicle1Id = await createVehicleIfNotExists('TU 1234', {
    licensePlate: 'TU 1234', brand: 'Volvo', modelCar: 'FH16', year: 2022, fuelType: 'Diesel', KilometersLastOilChange: '125000'
  });
  const vehicle2Id = await createVehicleIfNotExists('TU 5678', {
    licensePlate: 'TU 5678', brand: 'MAN', modelCar: 'TGX', year: 2021, fuelType: 'Diesel', KilometersLastOilChange: '98000'
  });

  // 7. Site (Mine)
  const site = await sites.findOne({ nom_site: 'Mine de Phosphate Sfax' });
  let siteId: ObjectId;
  if (!site) {
    siteId = new ObjectId();
    await sites.insertOne({
      _id: siteId,
      nom_site: 'Mine de Phosphate Sfax',
      adresse_depart: 'Base TransMine Mégrine',
      adresse_arrivee: 'Mine Mdhilla, Gafsa',
      temp_trajet: '6h30',
      nom_resp_mine: 'Khalil Mansour',
      telephone_resp_mine: '+216 97 888 999',
      mail_resp_mine: 'k.mansour@mine.tn',
      prix_tonne: 85,
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Site créé');
  } else {
    siteId = site._id;
    console.log('Site déjà existant');
  }

  // 8. Assignment (Affectation)
  const assignmentExists = await assignments.findOne({ company: companyId });
  if (!assignmentExists) {
    await assignments.insertOne({
      drivers: [driverId],
      supervisors: [supervisorId],
      site: siteId,
      company: companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Assignment créée');
  }

  // 9. CompanySettings (horaires)
  const settingsExists = await companySettings.findOne({ company: companyId });
  if (!settingsExists) {
    await companySettings.insertOne({
      company: companyId,
      workStartHour: '06:00',
      workEndHour: '18:00',
      totalBreakHours: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Paramètres horaires créés');
  }

  // 10. Quelques données de démonstration
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Pointage du jour
  const pointageExists = await pointages.findOne({ driver: driverId, pointageDebut: { $gte: new Date(today.setHours(0,0,0,0)) } });
  if (!pointageExists) {
    await pointages.insertOne({
      driver: driverId,
      company: companyId,
      pointageDebut: new Date(),
      photoSelfie: TRUCK_PHOTO,
      photoKilometrage: TRUCK_PHOTO,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Pointage du jour créé');
  }

  // Activité exemple
  const activityExists = await activities.findOne({ driver: driverId, timestamp: { $gte: yesterday } });
  if (!activityExists) {
    await activities.insertOne({
      company: companyId,
      driver: driverId,
      vehicle: vehicle1Id,
      type: 'chargement', // à adapter selon ton enum ActivityType
      timestamp: new Date(),
      kilometers: 285000,
      weight: 42.5,
      location: 'Mine Mdhilla',
      photos: [TRUCK_PHOTO],
      validated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Activité exemple créée');
  }

  console.log('\nSEED TERMINÉE AVEC SUCCÈS !');
  console.log('Connexions de démo :');
  console.log('Super Admin    → super@transmine.tn       / Admin@1234');
  console.log('Admin société  → admin@transmine.tn       / Admin@1234');
  console.log('Superviseur    → superviseur@transmine.tn / Admin@1234');
  console.log('Chauffeur      → m.trabelsi@transmine.tn  / Admin@1234');

  await client.close();
}

seed().catch(err => {
  console.error('Erreur seed :', err);
  process.exit(1);
});