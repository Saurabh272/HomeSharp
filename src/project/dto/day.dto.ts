import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DayDto {
  @ApiProperty({
    type: Number,
    description: 'Date'
  })
  @IsNumber({}, { message: 'Invalid Date' })
  @IsNotEmpty({ message: 'Date is required' })
  date: number;

  @ApiProperty({
    type: String,
    description: 'Month'
  })
  @IsString({ message: 'Invalid Month' })
  @IsNotEmpty({ message: 'Month is required' })
  month: string;

  @ApiProperty({
    type: Number,
    description: 'Year'
  })
  @IsNumber({}, { message: 'Invalid Year' })
  @IsNotEmpty({ message: 'Year is required' })
  year: number;
}
