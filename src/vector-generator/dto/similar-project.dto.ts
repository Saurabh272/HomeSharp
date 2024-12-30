import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString, IsUUID, Matches
} from 'class-validator';

export class SimilarProjectDto {
  @ApiProperty({
    type: String,
    description: 'Configuration Id'
  })
  @IsUUID(4, { message: 'Invalid configuration id' })
  @IsOptional()
  configurationId?: string;

  @ApiProperty({
    type: String,
    description: 'Slug'
  })
  @IsString({ message: 'Invalid slug' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Not a Valid Slug' })
  @IsOptional()
  projectSlug?: string;
}
