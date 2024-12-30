import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class UpdateNameDto {
  @ApiProperty({
    description: 'Update user name',
    type: 'string'
  })
  @IsNotEmpty()
  @Length(3, 30, { message: 'Name must be between 3 and 30 characters long' })
  @Matches(/^\s*[a-zA-Z]+(?: [a-zA-Z]+)*\s*$/, {
    message: 'Name must not contain numeric or special characters and multiple spaces between words are not allowed'
  })
  name: string;
}
