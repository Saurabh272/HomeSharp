import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AttachmentRequestDto {
  @ApiProperty({
    description: 'Support Request Attachment',
    type: 'string'
  })
  @IsNotEmpty()

  attachment: Express.Multer.File;

  originalname: string;

  buffer: string;

  mimetype: string;
}
