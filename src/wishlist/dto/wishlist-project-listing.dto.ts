import { IsNumber, IsOptional } from 'class-validator';

export class WishlistProjectListingDto {
  @IsNumber({}, { message: 'Page must be a number' })
  @IsOptional()
  page?: number;

  @IsNumber({}, { message: 'Page must be a number' })
  @IsOptional()
  limit?: number;
}
