import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GetProjectDto {
  @ApiProperty({
    type: String,
    description: 'Project ID'
  })
  @IsUUID(4, { message: 'Invalid Project ID' })
  @IsNotEmpty({ message: 'Project ID is required' })
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    type: String,
    description: 'Wing ID'
  })
  @IsUUID(4, { message: 'Invalid Wing ID' })
  @IsNotEmpty({ message: 'Wing ID is required' })
  @IsOptional()
  wingId?: string;

  @ApiProperty({
    type: String,
    description: 'Configuration ID'
  })
  @IsUUID(4, { message: 'Invalid Configuration ID' })
  @IsNotEmpty({ message: 'Configuration ID is required' })
  @IsOptional()
  configurationId?: string;

  @ApiProperty({
    type: String,
    description: 'Developer ID'
  })
  @IsUUID(4, { message: 'Invalid Developer ID' })
  @IsNotEmpty({ message: 'Developer ID is required' })
  @IsOptional()
  developerId?: string;

  @ApiProperty({
    type: String,
    description: 'Address ID'
  })
  @IsUUID(4, { message: 'Invalid Address ID' })
  @IsNotEmpty({ message: 'Address ID is required' })
  @IsOptional()
  addressId?: string;
}
