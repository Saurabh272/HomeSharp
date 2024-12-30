import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmiCalculatorDto {
  @ApiProperty({
    type: String,
    description: 'Emi Calculator'
  })
  @IsNotEmpty({ message: 'Principal is required' })
  principal: number;

  @IsNotEmpty({ message: 'InterestRate is required' })
  interestRate: number;

  @IsNotEmpty({ message: 'Tenure is required' })
  tenure: number;
}
