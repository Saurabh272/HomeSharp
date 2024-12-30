import {
  IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID
} from 'class-validator';

export class AddWishlistProjectDto {
  @IsUUID(4, { message: 'Invalid Wishlist ID' })
  @IsOptional()
  wishlistId: string;

  @IsUUID(4, { message: 'Invalid Project ID' })
  @IsOptional()
  projectId: string;

  @IsNotEmpty()
  @IsBoolean()
  remove: boolean;

  @IsUUID(4, { message: 'Invalid Wishlist Project ID' })
  @IsOptional()
  wishlistProjectId: string;

  @IsString()
  projectSlug: string;
}
