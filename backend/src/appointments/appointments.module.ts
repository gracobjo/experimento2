import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { VisitorAppointmentsController } from './visitor-appointments.controller';
import { VisitorAppointmentsService } from './visitor-appointments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../auth/email.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentsController, VisitorAppointmentsController],
  providers: [AppointmentsService, VisitorAppointmentsService, EmailService],
  exports: [AppointmentsService, VisitorAppointmentsService],
})
export class AppointmentsModule {} 