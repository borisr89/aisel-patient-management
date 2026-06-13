import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PatientsController } from '../patients/patients/patients.controller';
import { PatientsService } from '../patients/patients/patients.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
