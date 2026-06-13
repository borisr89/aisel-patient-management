import { Injectable, NotFoundException } from '@nestjs/common';

import { type Patient, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma/prisma.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import {
  PatientSortBy,
  PatientsQueryDto,
  SortOrder,
} from '../dto/patients-query.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PaginatedPatientsResponse } from '../interfaces/paginated-patients-response.interface';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PatientsQueryDto): Promise<PaginatedPatientsResponse> {
    const { page, limit, sortBy, sortOrder } = query;

    const search = query.search?.trim();

    const where: Prisma.PatientWhereInput | undefined = search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              phoneNumber: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : undefined;

    const skip = (page - 1) * limit;

    const primaryOrderBy = this.buildOrderBy(sortBy, sortOrder);

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          primaryOrderBy,
          {
            id: 'asc',
          },
        ],
      }),
      this.prisma.patient.count({
        where,
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: {
        id,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found.');
    }

    return patient;
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    return this.prisma.patient.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        phoneNumber: dto.phoneNumber?.trim() || null,
        dob: this.parseDateOnly(dto.dob),
      },
    });
  }

  async update(id: string, dto: UpdatePatientDto): Promise<Patient> {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: {
        id,
      },
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        phoneNumber: dto.phoneNumber?.trim() || null,
        dob: this.parseDateOnly(dto.dob),
      },
    });
  }

  async remove(id: string): Promise<{ ok: true }> {
    await this.findOne(id);

    await this.prisma.patient.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
    };
  }

  private parseDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private buildOrderBy(
    sortBy: PatientSortBy,
    sortOrder: SortOrder,
  ): Prisma.PatientOrderByWithRelationInput {
    switch (sortBy) {
      case PatientSortBy.FIRST_NAME:
        return {
          firstName: sortOrder,
        };

      case PatientSortBy.EMAIL:
        return {
          email: sortOrder,
        };

      case PatientSortBy.DOB:
        return {
          dob: sortOrder,
        };

      case PatientSortBy.CREATED_AT:
        return {
          createdAt: sortOrder,
        };

      case PatientSortBy.LAST_NAME:
      default:
        return {
          lastName: sortOrder,
        };
    }
  }
}
