export type ProfileDetails = {
  name: string;
  email: string;
  phoneNumber: string;
  externalId?: string;
};

type ProfileImage = {
  image: string;
};

export type WishlistDetails = {
  projectSlug: string;
};

export type TransformedResponse = {
  name: string;
  email: string;
  phoneNumber: string;
  profileCompleted: boolean;
  image: string | null;
  wishlistItems: string[];
};

export type ProcessInput = {
  profileDetails: ProfileDetails;
  profileImage: ProfileImage;
  wishlistDetails: WishlistDetails[];
};

export type UpdateProfileResponse = {
  message?: string;
  statusCode?: number;
};
