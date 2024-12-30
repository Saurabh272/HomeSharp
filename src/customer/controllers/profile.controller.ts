import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { throttlerConfig } from '../../app/config/throttler.config';
import { CustomerService } from '../services/customer.service';
import { UpdateNameDto } from '../dto/update-name.dto';
import { UpdateProfileImageRequest } from '../dto/update-profile-photo.dto';
import { TrimStringsPipe } from '../../app/pipe/trim-strings.pipe';
import { TransformedResponse, UpdateProfileResponse } from '../types/profile-details.type';
import { ProfileDetailTransformer } from '../transformers/profile-details.transformer';
import { UserInterface } from '../../auth/interfaces/user.interface';
import uploadConfig from '../../app/config/upload.config';

@Throttle({ default: { ttl: throttlerConfig.profile.ttl, limit: throttlerConfig.profile.limit } })
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly profileDetailTransformer: ProfileDetailTransformer
  ) {}

  @Put()
  @UseGuards(AuthGuard())
  @UsePipes(new TrimStringsPipe())
  update(
    @Req() req: { user: UserInterface },
    @Body() updateNameRequest: UpdateNameDto
  ): Promise<UpdateProfileResponse> {
    return this.customerService.updateProfile(req.user.id, updateNameRequest);
  }

  @Get()
  @UseGuards(AuthGuard())
  async getProfileDetails(@Req() req: { user: UserInterface }): Promise<TransformedResponse> {
    const [profileDetails, profileImage, wishlistDetails] = await this.customerService.getProfileDetails(req.user.id);

    return this.profileDetailTransformer.process({
      profileDetails,
      profileImage,
      wishlistDetails
    });
  }

  @Throttle({ default: { ttl: throttlerConfig.uploadPhoto.ttl, limit: throttlerConfig.uploadPhoto.limit } })
  @Post('/upload-profile-photo')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  async uploadPhoto(@UploadedFile() image: UpdateProfileImageRequest, @Req() req: { user: UserInterface }) {
    if (!uploadConfig.allowedImageMimeTypes.includes(image?.mimetype)) {
      throw new BadRequestException('Only image files are allowed. Allowed image formats are: JPEG, PNG, WEBP');
    }

    return this.customerService.uploadProfilePhoto(req.user.id, image);
  }
}
