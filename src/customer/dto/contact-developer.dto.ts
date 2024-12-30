import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsString, Length, Matches
} from 'class-validator';

export class ContactDeveloperDto {
  @ApiProperty({
    description: 'Message for the developer',
    type: 'string'
  })
  @IsNotEmpty()
  @IsString()
  @Length(20, 500, { message: 'Message length should be between 20 and 500 characters' })
  message: string;

  @ApiProperty({
    type: String,
    description: 'Developer Slug'
  })
  @IsString({ message: 'Invalid slug' })
  @IsNotEmpty({ message: 'Slug is required' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Not a valid slug' })
  developerSlug: string;
}
