import { Express } from 'express';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FilesImportPayload {
  @ApiProperty({
    type: 'file',
    description: 'Project File'
  })
  @IsNotEmpty()
  projectFile: Express.Multer.File[];

  @ApiProperty({
    type: 'file',
    description: 'Micro Market File'
  })
  @IsNotEmpty()
  microMarketFile: Express.Multer.File[];
}
