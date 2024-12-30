import { Test, TestingModule } from '@nestjs/testing';
import { Db } from '../../app/utils/db.util';
import { ProjectCategoriesController } from '../controllers/project-categories.controller';
import { ProjectCategoriesService } from '../services/project-categories.service';
import { ProjectListingRepository } from '../repositories/project-listing.repository';
import { CategoryTransformer } from '../transformers/category.transformer';
import { AddressEntity } from '../../app/entities/address.entity';
import { CategoryEntity } from '../entities/category.entity';
import { ConfigurationEntity } from '../entities/configuration.entity';
import { DeveloperEntity } from '../../developer/entities/developer.entity';
import { DirectusFilesEntity } from '../../app/entities/directus-file.entity';
import { FeatureCategoryEntity } from '../entities/feature-category.entity';
import { FeatureEntity } from '../entities/feature.entity';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectCategoryEntity } from '../entities/project-category.entity';
import { ProjectFeatureEntity } from '../entities/project-feature.entity';
import { ProjectFilesFloorPlanEntity } from '../entities/project-file-floor-plan.entity';
import { ProjectFilesImagesEntity } from '../entities/project-file-image.entity';
import { ProjectValidationRuleEntity } from '../entities/project-validation-rule.entity';
import { ReraStageEntity } from '../entities/rera-stage.entity';
import { SeoPropertiesEntity } from '../../app/entities/seo-properties.entity';
import { WingConfigurationEntity } from '../entities/wing-configuration.entity';
import { WingEntity } from '../entities/wing.entity';
import { WishlistEntity } from '../../wishlist/entities/wishlist.entity';
import { WishlistProjectEntity } from '../../wishlist/entities/wishlist-project.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { RelationshipManagerEntity } from '../entities/relationship-manager.entity';
import { ContactDetailEntity } from '../entities/contact-detail.entity';
import { MicroMarketEntity } from '../entities/micro-market.entity';
import config from '../../app/config';
import { mockDb } from '../../app/tests/mock-providers';
import { CustomSeoEntity } from '../entities/custom-seo.entity';

describe('ProjectCategoriesController', () => {
  let controller: ProjectCategoriesController;
  let service: ProjectCategoriesService;
  let transformer: CategoryTransformer;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        controllers: [ProjectCategoriesController],
        providers: [
          ProjectCategoriesService,
          ProjectListingRepository,
          CategoryTransformer,

          AddressEntity,
          CategoryEntity,
          ConfigurationEntity,
          DeveloperEntity,
          DirectusFilesEntity,
          FeatureCategoryEntity,
          FeatureEntity,
          ProjectCategoryEntity,
          ProjectEntity,
          ProjectFeatureEntity,
          ProjectFeatureEntity,
          ProjectFilesFloorPlanEntity,
          ProjectFilesImagesEntity,
          ProjectValidationRuleEntity,
          ReraStageEntity,
          SeoPropertiesEntity,
          WishlistEntity,
          WishlistProjectEntity,
          WingConfigurationEntity,
          WingEntity,
          CustomerEntity,
          RelationshipManagerEntity,
          MicroMarketEntity,
          ContactDetailEntity,
          CustomSeoEntity,

          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<ProjectCategoriesController>(ProjectCategoriesController);
    service = module.get<ProjectCategoriesService>(ProjectCategoriesService);
    transformer = module.get<CategoryTransformer>(CategoryTransformer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProjectCategories', () => {
    it('should return an array of project categories', async () => {
      const categories = [{
        name: 'Category1',
        slug: 'category1',
        image: {
          url: 'http://example.com/category1.jpg',
          alt: 'Category 1 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }, {
        name: 'Category2',
        slug: 'category2',
        image: {
          url: 'http://example.com/category2.jpg',
          alt: 'Category 2 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }];

      jest
        .spyOn(service, 'getProjectCategories')
        .mockResolvedValue(categories);

      jest
        .spyOn(transformer, 'process')
        .mockReturnValue({ categories });

      const result = await controller.getProjectCategories();

      expect(result).toEqual({ categories });
    });

    it('should not return an empty array', async () => {
      const categories = [{
        name: 'Category1',
        slug: 'category1',
        image: {
          url: 'http://example.com/category1.jpg',
          alt: 'Category 1 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }, {
        name: 'Category2',
        slug: 'category2',
        image: {
          url: 'http://example.com/category2.jpg',
          alt: 'Category 2 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }];
      jest
        .spyOn(service, 'getProjectCategories')
        .mockResolvedValue(categories);

      jest
        .spyOn(transformer, 'process')
        .mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories.length).toBeGreaterThan(0);
    });

    it('should call the getProjectCategories method of the projectCategoriesService', async () => {
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue([]);

      await controller.getProjectCategories();

      expect(service.getProjectCategories).toHaveBeenCalled();
    });

    it('should call the getProjectCategories method of the projectCategoriesService only once', async () => {
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue([]);

      await controller.getProjectCategories();

      expect(service.getProjectCategories).toHaveBeenCalledTimes(1);
    });

    it('should call the getProjectCategories method of the categoryTransformer only once', async () => {
      const categories = [{
        name: 'Category1',
        slug: 'category1',
        image: {
          url: 'http://example.com/category1.jpg',
          alt: 'Category 1 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }, {
        name: 'Category2',
        slug: 'category2',
        image: {
          url: 'http://example.com/category2.jpg',
          alt: 'Category 2 Image'
        },
        title: 'Title',
        description: 'Test Description'
      }];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      await controller.getProjectCategories();

      expect(transformer.process).toHaveBeenCalledTimes(1);
    });

    it('should return the expected result format for a single project category', async () => {
      const category = {
        name: 'Category1',
        slug: 'category1',
        image: {
          url: 'http://example.com/category1.jpg',
          alt: 'Category 1 Image'
        },
        title: 'Title',
        description: 'Test Description'
      };
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue([category]);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories: [category] });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0]).toHaveProperty('name', category.name);
      expect(result.categories[0]).toHaveProperty('slug', category.slug);
      expect(result.categories[0].image).toHaveProperty('url', category.image.url);
      expect(result.categories[0].image).toHaveProperty('alt', category.image.alt);
    });

    it('should return the expected result format for multiple project categories', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image: {
            url: 'http://example.com/category1.jpg',
            alt: 'Category 1 Image'
          },
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image: {
            url: 'http://example.com/category2.jpg',
            alt: 'Category 2 Image'
          },
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result = await controller.getProjectCategories();

      expect(result).toEqual({ categories });
    });

    it('should return the correct project category names', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image: null,
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image: null,
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0].name).toBe('Category1');
      expect(result.categories[1].name).toBe('Category2');
    });

    it('should return the correct project category slugs', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image: null,
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image: null,
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0].slug).toBe('category1');
      expect(result.categories[1].slug).toBe('category2');
    });

    it('should return the correct project category image URLs', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image: {
            url: 'http://example.com/category1.jpg',
            alt: 'Category 1 Image'
          },
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image: {
            url: 'http://example.com/category2.jpg',
            alt: 'Category 2 Image'
          },
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0].image.url).toBe('http://example.com/category1.jpg');
      expect(result.categories[1].image.url).toBe('http://example.com/category2.jpg');
    });

    it('should return null for project categories without images', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image: null,
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image: { url: 'http://example.com/category2.jpg', alt: 'Category 2 Image' },
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0].image).toBeNull();
      expect(result.categories[1].image).not.toBeNull();
    });

    it('should return the correct project category image alt texts', async () => {
      const categories = [
        {
          name: 'Category1',
          slug: 'category1',
          image:
          {
            url: 'http://example.com/category1.jpg',
            alt: 'Category 1 Image'
          },
          title: 'Title',
          description: 'Test Description'
        },
        {
          name: 'Category2',
          slug: 'category2',
          image:
          {
            url: 'http://example.com/category2.jpg',
            alt: 'Category 2 Image'
          },
          title: 'Title',
          description: 'Test Description'
        }
      ];
      jest.spyOn(service, 'getProjectCategories').mockResolvedValue(categories);
      jest.spyOn(transformer, 'process').mockReturnValue({ categories });

      const result: any = await controller.getProjectCategories();

      expect(result.categories[0].image.alt).toBe('Category 1 Image');
      expect(result.categories[1].image.alt).toBe('Category 2 Image');
    });

    it('should call the repository\'s getProjectCategories method with the correct parameters', async () => {
      const repositorySpy = jest.spyOn(service.projectListingRepository, 'getCategories')
        .mockResolvedValue([]);

      await controller.getProjectCategories();

      expect(repositorySpy).toHaveBeenCalledWith();
    });

    it('should call the repository\'s getProjectCategories method only once', async () => {
      const repositorySpy = jest.spyOn(service.projectListingRepository, 'getCategories')
        .mockResolvedValue([]);

      await controller.getProjectCategories();

      expect(repositorySpy).toHaveBeenCalledTimes(1);
    });

    it('should handle errors correctly in the repository\'s getProjectCategories method', async () => {
      const error = new Error('Database error');
      jest.spyOn(service.projectListingRepository, 'getCategories').mockRejectedValue(error);
      const transformerProcessSpy = jest.spyOn(transformer, 'process');

      expect(transformerProcessSpy).not.toHaveBeenCalled();

      await expect(controller.getProjectCategories()).rejects.toThrow(error);
    });

    it('should return an empty array if input data is empty', () => {
      const result = transformer.process([]);
      expect(result).toEqual([]);
    });

    it('should transform data correctly', () => {
      const input = [
        { name: 'Category 1', slug: 'category-1', image: 'image-1.jpg' },
        {
          name: 'Category 2', slug: 'category-2', image: 'image-2.jpg', title: 'Test', description: 'Test Description'
        }
      ];
      const expectedOutput = {
        categories: [
          {
            name: 'Category 1',
            slug: 'category-1',
            image: { url: `${config.DIRECTUS_URL}/assets/image-1.jpg`, alt: 'Category 1' },
            title: '',
            description: ''
          },
          {
            name: 'Category 2',
            slug: 'category-2',
            image: { url: `${config.DIRECTUS_URL}/assets/image-2.jpg`, alt: 'Category 2' },
            title: 'Test',
            description: 'Test Description'
          }
        ]
      };
      const result = transformer.process(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should return an object with empty URL and alt if image is not provided', () => {
      const result = transformer.getFileUrl('', 'Alt Text');

      expect(result).toEqual({ url: '', alt: 'Alt Text' });
    });

    it('should return an object with URL and alt if image is provided', () => {
      const result = transformer.getFileUrl('image.jpg', 'Alt Text');

      expect(result).toEqual({ url: `${config.DIRECTUS_URL}/assets/image.jpg`, alt: 'Alt Text' });
    });
  });
});
