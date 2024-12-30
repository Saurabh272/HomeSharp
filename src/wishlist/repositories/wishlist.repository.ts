import { Injectable, Logger } from '@nestjs/common';
import { sql, eq, desc } from 'drizzle-orm';
import {
  DirectusClient,
  RestClient,
  StaticTokenClient,
  createItem,
  deleteItem,
  readItems
} from '@directus/sdk';
import { alias } from 'drizzle-orm/pg-core';
import { Db } from '../../app/utils/db.util';
import { IRepository } from '../../app/interfaces/repository.interface';
import { WishlistEntity } from '../entities/wishlist.entity';
import { WishlistProjectEntity } from '../entities/wishlist-project.entity';
import { ProjectEntity } from '../../project/entities/project.entity';
import { ProjectFilesImagesEntity } from '../../project/entities/project-file-image.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';

@Injectable()
export class WishlistRepository implements IRepository {
  public readonly logger = new Logger(WishlistRepository.name);

  private client: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  public readonly entities: {
    wishlist: any,
    project: any,
    wishlistProjects: any,
    projectFiles: any,
    seoProperties: any
  };

  private readonly projectSeoProperties: any;

  constructor(
    private readonly db: Db,
    private readonly wishlistEntity: WishlistEntity,
    private readonly wishlistProjectEntity: WishlistProjectEntity,
    private readonly projectEntity: ProjectEntity,
    private readonly projectFileEntity: ProjectFilesImagesEntity,
    private readonly seoPropertiesEntity: SeoPropertiesEntity

  ) {
    this.client = db.getDirectusClient();
    this.entities = {
      wishlist: this.wishlistEntity.wishlist,
      project: this.projectEntity.projects,
      wishlistProjects: this.wishlistProjectEntity.wishlistProject,
      projectFiles: this.projectFileEntity.projectFiles,
      seoProperties: this.seoPropertiesEntity.seoProperties
    };

    this.projectSeoProperties = alias(this.entities.seoProperties, 'projectSeoProperties');
  }

  private wishlistDataMapper(id: string) {
    return {
      [this.wishlistEntity.customerId]: id
    };
  }

  async addWishlist(id: string) {
    const dataToSave = this.wishlistDataMapper(id);
    return this.client.request(createItem(this.wishlistEntity.tableName, dataToSave));
  }

  public async getById(id: string) {
    return this.db.connection
      .select({
        id: this.entities.wishlist.id,
        name: this.entities.wishlist.name,
        images: this.entities.projectFiles.directusFileId,
        dateCreated: this.entities.wishlist.dateCreated,
        projectName: this.entities.project.name
      })
      .from(this.entities.wishlist)
      .leftJoin(
        this.entities.wishlistProjects,
        eq(this.entities.wishlistProjects.wishlistId, this.entities.wishlist.id)
      )
      .leftJoin(
        this.entities.project,
        eq(this.entities.project.id, this.entities.wishlistProjects.projectId)
      )
      .leftJoin(
        this.entities.projectFiles,
        eq(this.entities.projectFiles.projectId, this.entities.project.id)
      )
      .where(sql`${this.entities.wishlist.customerId} = ${id}`);
  }

  public async getProjectSlugById(id: string) {
    return this.db.connection
      .select({
        id: this.entities.wishlist.id,
        name: this.entities.wishlist.name,
        images: this.entities.projectFiles.directusFileId,
        dateCreated: this.entities.wishlist.dateCreated,
        projectName: this.entities.project.name,
        projectSlug: this.projectSeoProperties.slug
      })
      .from(this.entities.wishlist)
      .leftJoin(
        this.entities.wishlistProjects,
        eq(this.entities.wishlistProjects.wishlistId, this.entities.wishlist.id)
      )
      .leftJoin(
        this.entities.project,
        eq(this.entities.project.id, this.entities.wishlistProjects.projectId)
      )
      .leftJoin(
        this.entities.projectFiles,
        eq(this.entities.projectFiles.projectId, this.entities.project.id)
      )
      .innerJoin(
        this.projectSeoProperties,
        eq(this.projectSeoProperties.id, this.entities.project.seoProperties)
      )
      .where(sql`${this.entities.wishlist.customerId} = ${id}`);
  }

  async addProject(wishlistId: any, projectId: any) {
    return this.client.request(createItem(this.wishlistProjectEntity.tableName, {
      [this.wishlistEntity.projectId]: projectId,
      [this.wishlistEntity.wishlistId]: wishlistId
    }));
  }

  async removeProject(id: any) {
    return this.client.request(deleteItem(this.wishlistProjectEntity.tableName, id));
  }

  async getWishlist(id: string) {
    const result = await this.client.request(readItems(this.wishlistEntity.tableName, {
      filter: {
        [this.wishlistEntity.customerId]: {
          _eq: id
        }
      }
    }));

    return result?.[0]?.id;
  }

  async getWishlistProjectId(projectId: any, wishlistId: any) {
    const result = await this.client.request(readItems(this.wishlistProjectEntity.tableName, {
      filter: {
        [this.wishlistEntity.projectId]: {
          _eq: projectId
        },
        [this.wishlistEntity.wishlistId]: {
          _eq: wishlistId
        }
      }
    }));

    return result?.[0]?.id;
  }

  async getProjectsIds(id: string) {
    return this.db.connection
      .select({
        projectId: this.entities.wishlistProjects.projectId
      })
      .from(this.entities.wishlistProjects)
      .where(sql`${this.entities.wishlistProjects.wishlistId} = ${id}`)
      .orderBy(desc(this.entities.wishlistProjects.dateCreated));
  }
}
