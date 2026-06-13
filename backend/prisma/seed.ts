import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { Pool } from 'pg';

import { PrismaClient } from '@prisma/client';
import { Role } from '../src/generated/prisma/enums';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const patients = [
  {
    firstName: 'Anna',
    lastName: 'Andersen',
    email: 'anna.andersen@example.com',
    phoneNumber: '+45 20 11 22 33',
    dob: '1987-03-14',
  },
  {
    firstName: 'Emil',
    lastName: 'Hansen',
    email: 'emil.hansen@example.com',
    phoneNumber: '+45 21 34 55 89',
    dob: '1991-07-22',
  },
  {
    firstName: 'Sofia',
    lastName: 'Larsen',
    email: 'sofia.larsen@example.com',
    phoneNumber: '+45 23 42 15 76',
    dob: '1984-11-05',
  },
  {
    firstName: 'Lucas',
    lastName: 'Nielsen',
    email: 'lucas.nielsen@example.com',
    phoneNumber: '+45 25 87 41 23',
    dob: '1995-01-18',
  },
  {
    firstName: 'Freja',
    lastName: 'Jensen',
    email: 'freja.jensen@example.com',
    phoneNumber: null,
    dob: '1990-09-30',
  },
  {
    firstName: 'Oliver',
    lastName: 'Pedersen',
    email: 'oliver.pedersen@example.com',
    phoneNumber: '+45 27 11 45 90',
    dob: '1979-06-12',
  },
  {
    firstName: 'Clara',
    lastName: 'Madsen',
    email: 'clara.madsen@example.com',
    phoneNumber: '+45 28 49 62 10',
    dob: '1988-02-27',
  },
  {
    firstName: 'William',
    lastName: 'Kristensen',
    email: 'william.kristensen@example.com',
    phoneNumber: null,
    dob: '1993-12-09',
  },
  {
    firstName: 'Ida',
    lastName: 'Thomsen',
    email: 'ida.thomsen@example.com',
    phoneNumber: '+45 29 35 18 44',
    dob: '1982-04-16',
  },
  {
    firstName: 'Noah',
    lastName: 'Christensen',
    email: 'noah.christensen@example.com',
    phoneNumber: '+45 30 72 14 59',
    dob: '1997-08-21',
  },
  {
    firstName: 'Emma',
    lastName: 'Poulsen',
    email: 'emma.poulsen@example.com',
    phoneNumber: '+45 31 90 25 73',
    dob: '1986-10-04',
  },
  {
    firstName: 'Oscar',
    lastName: 'Johansen',
    email: 'oscar.johansen@example.com',
    phoneNumber: null,
    dob: '1975-05-25',
  },
  {
    firstName: 'Alma',
    lastName: 'Mortensen',
    email: 'alma.mortensen@example.com',
    phoneNumber: '+45 32 19 84 60',
    dob: '1994-03-07',
  },
  {
    firstName: 'Elias',
    lastName: 'Knudsen',
    email: 'elias.knudsen@example.com',
    phoneNumber: '+45 33 47 52 18',
    dob: '1989-07-13',
  },
  {
    firstName: 'Laura',
    lastName: 'Rasmussen',
    email: 'laura.rasmussen@example.com',
    phoneNumber: '+45 34 76 90 12',
    dob: '1981-01-29',
  },
];

async function main(): Promise<void> {
  const [adminPasswordHash, userPasswordHash] = await Promise.all([
    hash('Admin123!', 10),
    hash('User123!', 10),
  ]);

  await prisma.user.upsert({
    where: {
      email: 'admin@aisel.local',
    },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@aisel.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'user@aisel.local',
    },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
    create: {
      email: 'user@aisel.local',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  // Development-only deterministic seed.
  await prisma.patient.deleteMany();

  await prisma.patient.createMany({
    data: patients.map((patient) => ({
      ...patient,
      dob: new Date(`${patient.dob}T00:00:00.000Z`),
    })),
  });

  console.log(
    `Seed completed: 2 users and ${patients.length} patients created.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
