import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SupportRequestDto {
  @ApiProperty({ type: String, description: 'Support Request' })
  @IsNotEmpty({ message: 'Name should not be empty' })
  @IsString({ message: 'Name should be a string' })
  @Matches(/^[a-zA-Z\s]{3,30}$/, { message: 'Name must contain 3 to 30 characters and only letters and spaces' })
  name: string;

  @IsNotEmpty({ message: 'Subject should not be empty' })
  @IsString({ message: 'Subject should be a string' })
  @Matches(/^[a-zA-Z\s]{3,30}$/, { message: 'Subject must contain 3 to 30 characters and only letters and spaces' })
  subject: string;

  @IsNotEmpty({ message: 'Issue description should not be empty' })
  @IsString({ message: 'Issue description should be a string' })
  @Matches(/^[a-zA-Z0-9.\-,?\s\n]{20,500}$/, {
    message: 'Issue description must contain 20 to 500 characters '
    + 'and only letters, numbers, spaces, and specified special characters'
  })
  issueDescription: string;
}
