import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancellationReasonDto {
  @ApiProperty({
    type: String,
    description: 'Cancellation Reason'
  })
  @IsString({ message: 'Invalid Cancellation Reason' })
  value: string;
}
