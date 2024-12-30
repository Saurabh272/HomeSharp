import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppModule } from '../app/app.module';
import { SeederController } from './controllers/seeder.controller';
import { SeederEntity } from './entities/seeder.entities';
import { SeederGenerator } from './generators/seeder.generator';
import { SeederRepository } from './repositories/seeder.repository';
import { SeederService } from './services/seeder.service';
import { DataImporterModule } from '../data-importer/data-importer.module';

@Module({
  imports: [
    AppModule,
    EventEmitterModule,
    DataImporterModule
  ],
  controllers: [SeederController],
  providers: [
    SeederEntity,
    SeederGenerator,
    SeederRepository,
    SeederService
  ]
})
export class SeederModule {}
