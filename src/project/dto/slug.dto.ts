import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SlugDto {
  @ApiProperty({
    type: String,
    description: 'Slug'
  })
  @IsString({ message: 'Invalid slug' })
  @IsNotEmpty({ message: 'Slug is required' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Not a Valid Slug' })
  slug: string;
}
