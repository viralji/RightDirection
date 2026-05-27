import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentDocumentsService } from './student-documents.service';
import { DocumentModule } from '../document/document.module';
import { PrismaService } from '../../lib/prisma.service';

@Module({
  imports: [DocumentModule],
  controllers: [StudentController],
  providers: [StudentService, StudentDocumentsService, PrismaService],
  exports: [StudentService],
})
export class StudentModule {}
