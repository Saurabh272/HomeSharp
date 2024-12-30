import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WishlistRepository } from '../repositories/wishlist.repository';
import { AddWishlistProjectDto } from '../dto/add-wishlist-project.dto';
import { TourService } from '../../project/services/tour.service';

@Injectable()
export class WishlistService {
  public readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly tourService: TourService
  ) {}

  async createWishlist(id: string): Promise<string> {
    const response: { id?: string } = await this.wishlistRepository.addWishlist(id);
    return response?.id;
  }

  async getWishlistId(id: string): Promise<string> {
    return this.wishlistRepository.getWishlist(id);
  }

  async addOrRemoveProject(id: string, projectDetails: AddWishlistProjectDto): Promise<{ message: string }> {
    try {
      if (!projectDetails.projectSlug) {
        return { message: 'ProjectSlug is required' };
      }
      const [projectId, wishlistId] = await Promise.all([
        this.tourService.getProjectId(projectDetails?.projectSlug),
        this.getOrCreateWishlist(id)
      ]);

      if (projectDetails.remove === true) {
        await this.removeProject(projectId, wishlistId);
        return { message: 'Project removed successfully' };
      }

      if (await this.isProjectSlugPresent(id, projectDetails.projectSlug)) {
        return { message: 'Project already exists in wishlist' };
      }
      await this.addProject(wishlistId, projectId);

      return { message: 'Project added successfully' };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error?.message);
    }
  }

  private async removeProject(projectId: string, wishlistId: string): Promise<void> {
    const wishlistProjectId = await this.wishlistRepository.getWishlistProjectId(projectId, wishlistId);
    if (!wishlistProjectId) {
      throw new BadRequestException('Project not found in wishlist');
    }
    await this.wishlistRepository.removeProject(wishlistProjectId);
  }

  private async isProjectSlugPresent(id: string, projectSlug: string): Promise<boolean> {
    const wishlistsProjects = await this.wishlistRepository.getProjectSlugById(id);

    return wishlistsProjects.some((item) => item.projectSlug === projectSlug);
  }

  async getOrCreateWishlist(id: string): Promise<string> {
    let wishlistId = await this.getWishlistId(id);
    if (!wishlistId) {
      wishlistId = await this.createWishlist(id);
    }

    return wishlistId;
  }

  async addProject(wishlistId: string, projectId: string): Promise<void> {
    await this.wishlistRepository.addProject(wishlistId, projectId);
  }

  async getProjectIds(id: string): Promise<string[]> {
    const response: { projectId: string }[] = await this.wishlistRepository.getProjectsIds(id);

    return response.map((item) => item.projectId);
  }
}
