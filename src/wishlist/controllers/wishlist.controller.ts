import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from '../services/wishlist.service';
import { AddWishlistProjectDto } from '../dto/add-wishlist-project.dto';
import { ProjectListingService } from '../../project/services/project-listing.service';
import { WishlistProjectListingDto } from '../dto/wishlist-project-listing.dto';
import { UserInterface } from '../../auth/interfaces/user.interface';

@Controller('wishlist')
export class WishlistController {
  constructor(
    private wishlistService: WishlistService,
    private readonly projectListingService: ProjectListingService

  ) {}

  @Post('/project')
  @UseGuards(AuthGuard())
  async addOrRemoveProject(@Req() req: { user: UserInterface }, @Body() request: AddWishlistProjectDto) {
    return this.wishlistService.addOrRemoveProject(req.user.id, request);
  }

  @Post('/listing')
  @UseGuards(AuthGuard())
  async getWishlistProjectListing(@Req() req: { user: UserInterface }, @Body() request: WishlistProjectListingDto) {
    const wishlistId = await this.wishlistService.getWishlistId(req.user.id);
    if (!wishlistId) {
      return {
        message: 'Wishlist not found'
      };
    }
    const projectIds = await this.wishlistService.getProjectIds(wishlistId);

    if (!projectIds?.length) {
      return {
        message: 'Wishlist projects not available'
      };
    }

    return this.projectListingService.getProjectsFromSearchServiceByIds({
      projectIds,
      page: request?.page,
      limit: request?.limit
    });
  }
}
