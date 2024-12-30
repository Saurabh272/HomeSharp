import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches
} from 'class-validator';

export class ContactAgentDto {
  @ApiProperty({
    description: 'Message for the agent',
    type: 'string'
  })
  @IsString({ message: 'Invalid message' })
  @IsOptional()
  message?: string;

  @ApiProperty({
    type: String,
    description: 'Project Slug'
  })
  @IsString({ message: 'Invalid slug' })
  @IsNotEmpty({ message: 'Slug is required' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Not a valid slug' })
  projectSlug: string;
}
