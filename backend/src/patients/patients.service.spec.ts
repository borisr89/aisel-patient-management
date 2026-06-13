import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import {
  PatientSortBy,
  PatientsQueryDto,
  SortOrder,
} from './dto/patients-query.dto';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  let service: PatientsService;

  const prismaMock = {
    patient: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const patient = {
    id: 'f374f6ba-4344-4a76-859f-d72e27a7c94d',
    firstName: 'Anna',
    lastName: 'Andersen',
    email: 'anna.andersen@example.com',
    phoneNumber: '+45 20 11 22 33',
    dob: new Date('1987-03-14T00:00:00.000Z'),
    createdAt: new Date('2026-06-15T10:00:00.000Z'),
    updatedAt: new Date('2026-06-15T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated patients and total count', async () => {
      prismaMock.patient.findMany.mockResolvedValue([patient]);

      prismaMock.patient.count.mockResolvedValue(11);

      const query: PatientsQueryDto = {
        search: 'anna',
        page: 2,
        limit: 10,
        sortBy: PatientSortBy.LAST_NAME,
        sortOrder: SortOrder.ASC,
      };

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: [patient],
        page: 2,
        limit: 10,
        total: 11,
      });

      expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              firstName: {
                contains: 'anna',
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: 'anna',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'anna',
                mode: 'insensitive',
              },
            },
            {
              phoneNumber: {
                contains: 'anna',
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: 10,
        take: 10,
        orderBy: [
          {
            lastName: 'asc',
          },
          {
            id: 'asc',
          },
        ],
      });

      expect(prismaMock.patient.count).toHaveBeenCalledWith({
        where: {
          OR: expect.any(Array),
        },
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('f374f6ba-4344-4a76-859f-d72e27a7c94d'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
