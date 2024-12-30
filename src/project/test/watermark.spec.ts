import { Test, TestingModule } from '@nestjs/testing';
import * as Jimp from 'jimp';
import * as fs from 'fs';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';
import { ProjectDetailController } from '../controllers/project-detail.controller';
import { WatermarkService } from '../services/watermark.service';
import { WatermarkRepository } from '../repositories/watermark.repository';
import { ProjectModule } from '../project.module';
import { WatermarkImageData } from '../interfaces/watermark.interface';

describe('Water Mark', () => {
  let service: WatermarkService;
  let repository: WatermarkRepository;

  const WaterMarkRepositoryMock = {
    upload: jest.fn(),
    updateFileName: jest.fn(),
    getImageName: jest.fn(),
    saveErrorLogs: jest.fn(),
    getOriginalImageById: jest.fn(),
    getProjectOriginalImages: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        imports: [ProjectModule],
        controllers: [ProjectDetailController],
        providers: [
          WatermarkService,
          mockDb,

          { provide: WatermarkRepository, useValue: WaterMarkRepositoryMock }
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    service = module.get<WatermarkService>(WatermarkService);
    repository = module.get<WatermarkRepository>(WatermarkRepository);
  });

  describe('applyWatermarkOnImage', () => {
    it('should upload watermarked image successfully', async () => {
      const formMock = {
        append: jest.fn()
      };

      jest.spyOn(FormData.prototype, 'append').mockImplementation(formMock.append);

      const readFileSyncMock = jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('fileData'));
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const unlinkSyncMock = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      const responseMock = {
        id: 'sampleId',
        charset: 'utf-8',
        description: 'Description',
        duration: 1000,
        embed: true
      };

      const image: any = 'image';

      jest.spyOn(repository, 'upload').mockResolvedValue(responseMock);
      jest.spyOn(repository, 'getImageName').mockResolvedValue(image);
      jest.spyOn(repository, 'updateFileName').mockResolvedValue(responseMock);

      const id = 'sampleId';
      const watermarkImagePath = '/watermarked_image.jpg';
      const result = await service.uploadWatermarkedImage(id, watermarkImagePath);

      expect(result).toEqual(responseMock);
      expect(formMock.append).toHaveBeenCalledWith('file', expect.any(Blob), id);
      expect(readFileSyncMock).toHaveBeenCalledWith(watermarkImagePath);
      expect(existsSyncMock).toHaveBeenCalledWith(watermarkImagePath);
      expect(unlinkSyncMock).toHaveBeenCalledWith(watermarkImagePath);
    });

    it('should create watermarked images successfully', async () => {
      const id = 'id';
      jest.spyOn(service, 'handleImageProcessing').mockResolvedValue('/image.jpg');
      jest.spyOn(service, 'uploadWatermarkedImage').mockResolvedValue(undefined);

      const result = await service.processWatermark(id);

      expect(result).toEqual({ message: 'Watermarked image created successfully' });
      expect(service.uploadWatermarkedImage).toHaveBeenCalledWith('id', '/image.jpg');
    });

    it('should handle error when reading images', async () => {
      jest.spyOn(service, 'convertImageToJpeg').mockResolvedValue(null);
      jest.spyOn(Jimp, 'read').mockRejectedValueOnce(new Error('error'));

      const result = await expect(service.applyWatermarkOnImage('test.jpg')).rejects.toThrow(new Error('error'));

      expect(result).toEqual(undefined);
    });
  });

  describe('extractUuidFromOriginalImage', () => {
    it('should extract UUID from a valid string', () => {
      const data = 'abc12345-6789-0123-4567-89abcdef0123.jpg';
      const result = service.extractUuidFromOriginalImage(data);
      expect(result).toBe('abc12345-6789-0123-4567-89abcdef0123');
    });

    it('should handle different UUID formats', () => {
      const data = 'xyz45678-9012-3456-789a-bcdef0123456.png';
      const result = service.extractUuidFromOriginalImage(data);
      expect(result).toBe('45678-9012-3456-789a-bcdef0123456');
    });

    it('should handle multiple UUIDs in a string and return the first one', () => {
      const data = 'abc12345-6789-0123-4567-89abcdef0123-def98765-4321-0123-4567-89abcdef0123.jpg';
      const result = service.extractUuidFromOriginalImage(data);
      expect(result).toBe('abc12345-6789-0123-4567-89abcdef0123');
    });

    it('should handle UUID at the beginning of the string', () => {
      const data = '123e4567-e89b-12d3-a456-426614174000-image.jpg';
      const result = service.extractUuidFromOriginalImage(data);
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  it('should apply watermark on original image successfully', async () => {
    const mockApplyWatermarks = jest.spyOn(service, 'applyWatermarks');
    mockApplyWatermarks.mockResolvedValue({ message: 'Watermarked image created successfully' });

    const mockSaveErrorLogs = jest.spyOn(repository, 'saveErrorLogs');

    const data: WatermarkImageData = {
      image: { id: 'sampleImageId', filename_download: 'sampleFileName.jpg' },
      fileName: undefined,
      id: 'sampleImageId'
    };

    const result = await service.applyWatermarkOnOriginalImage(data);

    expect(mockApplyWatermarks).toHaveBeenCalledWith('sampleImageId', 'sampleFileName.jpg');
    expect(result).toEqual({ message: 'Watermarked image created successfully' });
    expect(mockSaveErrorLogs).not.toHaveBeenCalled();
  });

  describe('extractImageIdsFromResult', () => {
    it('should return an empty array for an empty result', () => {
      const result = [];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual([]);
    });

    it('should extract a project picture ID', () => {
      const result = [{ projectPicture: 'picture1' }];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['picture1']);
    });

    it('should extract a project plan ID', () => {
      const result = [{ projectPlan: 'plan1' }];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['plan1']);
    });

    it('should extract multiple project picture IDs', () => {
      const result = [
        { projectPicture: 'picture1' },
        { projectPicture: 'picture2' },
        { projectPicture: 'picture3' }
      ];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['picture1', 'picture2', 'picture3']);
    });

    it('should extract multiple project plan IDs', () => {
      const result = [
        { projectPlan: 'plan1' },
        { projectPlan: 'plan2' },
        { projectPlan: 'plan3' }
      ];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['plan1', 'plan2', 'plan3']);
    });

    it('should handle null and undefined values in project picture and project plan', () => {
      const result = [{ projectPicture: null }, { projectPlan: undefined }];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual([]);
    });

    it('should extract image IDs from the "images" property', () => {
      const result = [{ images: ['image1.jpg', null, 'image2.jpg', undefined, 'image3.jpg'] }];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
    });

    it('should extract image IDs from the "floorPlans" property', () => {
      const result = [{ floorPlans: ['plan1.jpg', null, 'plan2.jpg', undefined, 'plan3.jpg'] }];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['plan1.jpg', 'plan2.jpg', 'plan3.jpg']);
    });

    it('should handle multiple properties with mixed values', () => {
      const result = [
        { projectPicture: 'picture1.jpg', images: ['image1.jpg', null, 'image2.jpg'] },
        { projectPlan: 'plan1.jpg', floorPlans: ['plan2.jpg', undefined, 'plan3.jpg'] }
      ];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual(['picture1.jpg', 'image1.jpg', 'image2.jpg', 'plan1.jpg', 'plan2.jpg', 'plan3.jpg']);
    });

    it('should handle an array with mixed properties', () => {
      const result = [
        { projectPicture: 'picture1.jpg', images: ['image1.jpg', null, 'image2.jpg'] },
        { projectPlan: 'plan1.jpg', floorPlans: ['plan2.jpg', undefined, 'plan3.jpg'] },
        { projectPlan: 'plan4.jpg' },
        { images: ['image3.jpg'] }
      ];
      const extractedIds = service.extractImageIdsFromResult(result);
      expect(extractedIds).toEqual([
        'picture1.jpg',
        'image1.jpg',
        'image2.jpg',
        'plan1.jpg',
        'plan2.jpg',
        'plan3.jpg',
        'plan4.jpg',
        'image3.jpg'
      ]);
    });
  });

  it('should not apply watermark when imageIds array is empty', async () => {
    jest.spyOn(repository, 'getOriginalImageById').mockResolvedValue([]);
    await service.processImageIds([]);
    expect(repository.getOriginalImageById).not.toBeCalled();
  });

  it('should not apply watermark when no original image found for any imageId', async () => {
    const mockApplyWatermarkOnOriginalImage = jest.spyOn(service, 'applyWatermarkOnOriginalImage');
    jest.spyOn(repository, 'getOriginalImageById').mockResolvedValue(null);
    await service.processImageIds(['id1', 'id2']);
    expect(repository.getOriginalImageById).toHaveBeenCalledTimes(2);
    expect(mockApplyWatermarkOnOriginalImage).not.toBeCalled();
  });

  it('should successfully process images for a project', async () => {
    const projectId = 'sampleProject';
    const sampleResult = [
      {
        projectPicture: '23e9e92c-0e07-4443-9855-c95addd5299d',
        projectPlan: 'a314ce71-f079-4d2b-8ce9-28fc71ed111e',
        images: [
          '05db7459-d4c7-4b84-b6a5-c71bc7464a41',
          '0f42eece-6dce-45bd-a085-90ea529aff56'
        ],
        floorPlans: [
          '11f6b4bf-08f0-4eff-bca6-99835eafba39'
        ],
        wingConfigurationFloorPlan: '101cdd21-085e-4b31-8c4e-a66c99ffa0bc'
      }
    ];

    const expectedImageIds = [
      '23e9e92c-0e07-4443-9855-c95addd5299d',
      'a314ce71-f079-4d2b-8ce9-28fc71ed111e',
      '05db7459-d4c7-4b84-b6a5-c71bc7464a41',
      '0f42eece-6dce-45bd-a085-90ea529aff56',
      '101cdd21-085e-4b31-8c4e-a66c99ffa0bc',
      '237b3a78-013d-4dac-b24c-15957ee3ad15',
      '5e41535e-38d6-4268-9536-b11ae3176732',
      '5fb24717-920c-4827-9d87-60b01802418e',
      '5ab26d18-8388-4531-ad56-db42a5843e86',
      'bbc94dbd-42ff-46b0-a8d3-ccb3dccc7b56'
    ];

    jest.spyOn(repository, 'getProjectOriginalImages').mockResolvedValue(sampleResult);
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue(expectedImageIds);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await service.processWithProjectId(projectId);

    expect(repository.getProjectOriginalImages).toHaveBeenCalledWith(projectId);
    expect(service.extractImageIdsFromResult).toHaveBeenCalledWith(sampleResult);
    expect(service.processImageIds).toHaveBeenCalledWith(expectedImageIds);
  });

  it('should handle the case where no images are found for a project', async () => {
    const projectId = 'emptyProject';

    jest.spyOn(repository, 'getProjectOriginalImages').mockResolvedValue([]);
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue([]);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await service.processWithProjectId(projectId);

    expect(repository.getProjectOriginalImages).toHaveBeenCalledWith(projectId);
    expect(service.extractImageIdsFromResult).not.toHaveBeenCalled();
    expect(service.processImageIds).not.toHaveBeenCalled();
  });

  it('should handle errors when fetching project images from the repository', async () => {
    const projectId = 'errorProject';
    const expectedError = new Error('Repository error');

    jest.spyOn(repository, 'getProjectOriginalImages').mockRejectedValue(expectedError);
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue([]);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await expect(service.processWithProjectId(projectId)).rejects.toThrow(expectedError);

    expect(repository.getProjectOriginalImages).toHaveBeenCalledWith(projectId);
    expect(service.extractImageIdsFromResult).not.toHaveBeenCalled();
    expect(service.processImageIds).not.toHaveBeenCalled();
  });

  it('should handle errors during image processing', async () => {
    const projectId = 'errorImageProcessing';
    const sampleResult = [
      {
        projectPicture: '23e9e92c-0e07-4443-9855-c95addd5299d',
        projectPlan: 'a314ce71-f079-4d2b-8ce9-28fc71ed111e',
        images: [
          '05db7459-d4c7-4b84-b6a5-c71bc7464a41',
          '0f42eece-6dce-45bd-a085-90ea529aff56'
        ],
        floorPlans: [
          '11f6b4bf-08f0-4eff-bca6-99835eafba39'
        ],
        wingConfigurationFloorPlan: '101cdd21-085e-4b31-8c4e-a66c99ffa0bc'
      }
    ];

    const expectedImageIds = [
      '23e9e92c-0e07-4443-9855-c95addd5299d',
      'a314ce71-f079-4d2b-8ce9-28fc71ed111e',
      '05db7459-d4c7-4b84-b6a5-c71bc7464a41',
      '0f42eece-6dce-45bd-a085-90ea529aff56',
      '101cdd21-085e-4b31-8c4e-a66c99ffa0bc',
      '237b3a78-013d-4dac-b24c-15957ee3ad15',
      '5e41535e-38d6-4268-9536-b11ae3176732',
      '5fb24717-920c-4827-9d87-60b01802418e',
      '5ab26d18-8388-4531-ad56-db42a5843e86',
      'bbc94dbd-42ff-46b0-a8d3-ccb3dccc7b56'
    ];
    const expectedError = new Error('Image processing error');

    jest.spyOn(repository, 'getProjectOriginalImages').mockResolvedValue(sampleResult);
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue(expectedImageIds);
    jest.spyOn(service, 'processImageIds').mockRejectedValue(expectedError);

    await expect(service.processWithProjectId(projectId)).rejects.toThrow(expectedError);

    expect(repository.getProjectOriginalImages).toHaveBeenCalledWith(projectId);
    expect(service.extractImageIdsFromResult).toHaveBeenCalledWith(sampleResult);
    expect(service.processImageIds).toHaveBeenCalledWith(expectedImageIds);
  });

  it('should handle the case where a developer has no projects', async () => {
    const developerId = 'noProjectsDeveloper';
    const sampleResult: any = [
      {
        heroImage: 'cc88c54f-1840-4dd8-b13e-81456640d877',
        projectId: ''
      }
    ];
    const heroImage = {
      id: sampleResult[0]?.heroImage,
      fileName: `${sampleResult[0]?.heroImage}.jpg`
    };

    jest.spyOn(repository, 'getDeveloperOriginalImages').mockResolvedValue(sampleResult);
    jest.spyOn(repository, 'getOriginalImageById').mockResolvedValue([heroImage]);
    jest.spyOn(repository, 'getProjectOriginalImages').mockResolvedValue(undefined);
    jest.spyOn(service, 'applyWatermarkOnOriginalImage').mockResolvedValue({
      message: 'Watermarked image created successfully'
    });
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue([]);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await service.processWithDeveloperId(developerId);

    expect(repository.getDeveloperOriginalImages).toHaveBeenCalledWith(developerId);
    expect(service.applyWatermarkOnOriginalImage).toHaveBeenCalledWith(heroImage);
    expect(service.extractImageIdsFromResult).toHaveBeenCalled();
    expect(service.processImageIds).toHaveBeenCalled();
  });

  it('should handle errors when fetching developer images from the repository', async () => {
    const developerId = 'errorDeveloper';
    const expectedError = new Error('Repository error');

    jest.spyOn(repository, 'getDeveloperOriginalImages').mockRejectedValue(expectedError);
    jest.spyOn(service, 'applyWatermarkOnOriginalImage').mockResolvedValue({
      message: 'Watermarked image created successfully'
    });
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue([]);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await expect(service.processWithDeveloperId(developerId)).rejects.toThrow(expectedError);

    expect(repository.getDeveloperOriginalImages).toHaveBeenCalledWith(developerId);
    expect(service.applyWatermarkOnOriginalImage).not.toHaveBeenCalled();
    expect(service.extractImageIdsFromResult).not.toHaveBeenCalled();
    expect(service.processImageIds).not.toHaveBeenCalled();
  });

  it('should handle errors during hero image processing', async () => {
    const developerId = 'errorHeroImageProcessing';
    const sampleResult: any = [
      {
        heroImage: 'cc88c54f-1840-4dd8-b13e-81456640d877',
        projectId: 'project1'
      }
    ];
    const heroImage = {
      id: sampleResult[0]?.heroImage,
      fileName: `${sampleResult[0]?.heroImage}.jpg`
    };
    const expectedError = new Error('Hero image processing error');

    jest.spyOn(repository, 'getDeveloperOriginalImages').mockResolvedValue(sampleResult);
    jest.spyOn(repository, 'getOriginalImageById').mockResolvedValue([heroImage]);
    jest.spyOn(service, 'applyWatermarkOnOriginalImage').mockRejectedValue(expectedError);
    jest.spyOn(service, 'extractImageIdsFromResult').mockReturnValue([]);
    jest.spyOn(service, 'processImageIds').mockResolvedValue(undefined);

    await expect(service.processWithDeveloperId(developerId)).rejects.toThrow(expectedError);

    expect(repository.getDeveloperOriginalImages).toHaveBeenCalledWith(developerId);
    expect(service.applyWatermarkOnOriginalImage).toHaveBeenCalledWith(heroImage);
    expect(service.extractImageIdsFromResult).not.toHaveBeenCalled();
    expect(service.processImageIds).not.toHaveBeenCalled();
  });

  it('should apply watermark on projects and developers concurrently', async () => {
    const request = { projectIds: ['projectId1', 'projectId2'], developerIds: ['developerId1', 'developerId2'] };
    jest.spyOn(service, 'applyWatermarkOnProjects').mockResolvedValue(undefined);
    jest.spyOn(service, 'applyWatermarkOnDevelopers').mockResolvedValue(undefined);

    await service.applyWatermark(request);

    expect(service.applyWatermarkOnProjects).toHaveBeenCalledWith(request.projectIds);
    expect(service.applyWatermarkOnDevelopers).toHaveBeenCalledWith(request.developerIds);
  });

  it('should apply watermark on projects when only projectIds are provided', async () => {
    const request = { projectIds: ['projectId1', 'projectId2'] };
    jest.spyOn(service, 'applyWatermarkOnProjects').mockResolvedValue(undefined);

    await service.applyWatermark(request);

    expect(service.applyWatermarkOnProjects).toHaveBeenCalledWith(request.projectIds);
  });

  it('should apply watermark on developers when only developerIds are provided', async () => {
    const request = { developerIds: ['developerId1', 'developerId2'] };
    jest.spyOn(service, 'applyWatermarkOnDevelopers').mockResolvedValue(undefined);

    await service.applyWatermark(request);

    expect(service.applyWatermarkOnDevelopers).toHaveBeenCalledWith(request.developerIds);
  });
});
