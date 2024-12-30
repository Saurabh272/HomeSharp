import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateProfileImageRequest {
  @ApiProperty({
    description: 'Update user profile image',
    type: 'string'
  })
  @IsNotEmpty()
  image: Express.Multer.File;

  originalname: string;

  buffer: string;

  mimetype?: string;
}
