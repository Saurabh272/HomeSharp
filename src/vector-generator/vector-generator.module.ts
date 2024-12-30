import { Module } from '@nestjs/common';
import { VectorGeneratorController } from './controllers/vector-generator.controller';
import { VectorGeneratorService } from './services/vector-generator.service';
import { VectorGeneratorRepository } from './repositories/vector-generator.repository';
import { AppModule } from '../app/app.module';
import { ProjectModule } from '../project/project.module';
import { ProjectVectorEntity } from './entities/project-vector.entity';

@Module({
  controllers: [VectorGeneratorController],
  imports: [
    AppModule,
    ProjectModule
  ],
  providers: [
    ProjectVectorEntity,
    VectorGeneratorService,
    VectorGeneratorRepository
  ]
})
export class VectorGeneratorModule {}
