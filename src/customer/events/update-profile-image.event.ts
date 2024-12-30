export class UpdateProfileImageEvent {
  image: Express.Multer.File;

  constructor(params: { image: Express.Multer.File }) {
    this.image = params?.image;
  }
}
