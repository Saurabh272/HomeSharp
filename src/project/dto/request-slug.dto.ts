import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidType } from '../decorators/isValidType.decorator';

export class RequestSlugDto {
  @ApiProperty({
    type: String,
    description: 'Type of Slug'
  })
  @IsString({ message: 'Invalid slug type' })
  @IsNotEmpty({ message: 'Slug type is required' })
  @IsValidType()
  type: string;
}
