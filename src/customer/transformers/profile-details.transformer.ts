import { Injectable } from '@nestjs/common';
import config from '../../app/config';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { ProcessInput, TransformedResponse, WishlistDetails } from '../types/profile-details.type';

@Injectable()
export class ProfileDetailTransformer implements ITransformer {
  process(data: ProcessInput): TransformedResponse {
    return {
      name: data?.profileDetails.name,
      email: data?.profileDetails.email,
      phoneNumber: data?.profileDetails.phoneNumber,
      profileCompleted: !!data?.profileDetails.name,
      image: data?.profileImage.image ? `${config.DIRECTUS_URL}/assets/${data?.profileImage?.image}` : null,
      wishlistItems: this.transformWishlistItems(data.wishlistDetails)
    };
  }

  private transformWishlistItems(wishlistDetails: WishlistDetails[]): string[] {
    return (wishlistDetails || [])
      .map((item) => item?.projectSlug)
      .filter((slug) => slug !== null && slug !== '');
  }
}
