import { ProjectDetailInterface } from '../interfaces/project-detail.interface';
import { WingConfigurationInterface } from '../interfaces/wing-configuration.interface';
import { FieldChoiceInterface } from '../interfaces/field-choice.interface';
import { ProjectDetail } from '../types/project-detail.type';
import config from '../../app/config';

export const mockProjectDetails: ProjectDetailInterface[] = [{
  projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
  projectName: '96 Tagore',
  projectSlug: '96-Tagore',
  projectDescription: 'Harum ipsam officiis veniam at eos corporis hic inventore esse.',
  propertyType: 'NEW',
  projectTitle: null,
  projectPicture: '060a8527-5a60-4d94-8daf-2722f0e45067.jpeg:96 Tagore',
  floorPlans: '87347882-25fd-4bf0-af6c-f385a41de22b.jpeg:96 Tagore,a3cf1c56-52bd-4734-b370-7a0d91dabb46.jpeg:96 Tagore',
  images: '87347882-25fd-4bf0-af6c-f385a41de22b.jpeg:96 Tagore,a3cf1c56-52bd-4734-b370-7a0d91dabb46.jpeg:96 Tagore',
  projectPlan: '32257f0d-e97b-4412-92ef-df975618a315.jpeg:96 Tagore',
  customMap: '',
  brochure: '1026434e-a100-42e1-abda-5c88410b4972.pdf',
  launchStatus: 'OC_RECEIVED',
  hidePrice: false,
  minimumPrice: 43464704,
  maximumPrice: 63115264,
  reraRegistrationNumbers: 'TEST87465/ 54883',
  houseType: 'Beds',
  minimumBedrooms: 1,
  maximumBedrooms: 1,
  minimumBathrooms: 5,
  maximumBathrooms: 5,
  minimumCarpetArea: 1188,
  maximumCarpetArea: 1188,
  areaUnit: 'sq. ft.',
  locality: 'East Karlhaven',
  latitude: 19.0760,
  longitude: 72.8777,
  developerName: 'SSD Ventures',
  developerSlug: 'SSD-Ventures',
  developerWebsite: 'https://www.SSD-Ventures.org',
  developerLogo: '7afb9b79-d626-49b8-a6b5-83bdca8b5c1e.jpeg:96 Tagore',
  developerAddressLine1: '43539 Irving Station',
  developerAddressLine2: 'Apt. 770',
  developerAddressCity: 'Mumbai',
  developerAddressState: 'Maharashtra',
  developerAddressPinCode: '400580',
  threeSixtyImage: null
}];

export const mockWingsConfigurations: WingConfigurationInterface[] = [{
  projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
  wingName: 'Block A',
  configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
  configurationName: '1BHK',
  floorPlan: '07d5ee28-f23f-4e85-a56b-eff9149eda93.jpeg:Block A',
  completionDate: '2021-09-30',
  projectStatus: '1',
  bedrooms: 1,
  houseType: 'Beds',
  bathrooms: 5,
  carpetArea: 1188,
  areaUnit: 'sq. ft.'
}];

export const mockFeatures = [
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1265,
    featureCategory: 'Computers',
    featureName: 'Walk-in Closets',
    featureList: [
      'illum consequatur quibusdam',
      'distinctio pariatur excepturi',
      'recusandae ipsa aliquam',
      'excepturi sunt harum'
    ],
    keyHighlight: false,
    featureImage: 'b5098c76-6b0f-4564-8ad4-0ca5e08d09d0.jpeg:Walk-in Closets'
  },
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1258,
    featureCategory: 'Outdoors',
    featureName: 'Pet Wash Station',
    featureList: ['nemo vero ex', 'ratione nulla asperiores'],
    keyHighlight: true,
    featureImage: 'f5b96616-e23d-4682-bc7a-0f221d08edfa.jpeg:Pet Wash Station'
  },
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1272,
    featureCategory: 'Tools',
    featureName: 'Metro',
    featureList: [
      'adipisci quisquam suscipit',
      'quae harum consequuntur',
      'sint dignissimos officiis',
      'molestiae perferendis quasi',
      'numquam quos incidunt'
    ],
    keyHighlight: false,
    featureImage: '6845986b-0345-40a2-a400-eeb3213980f7.png:Metro'
  },
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1262,
    featureCategory: 'Kids',
    featureName: 'Basketball Court',
    featureList: [
      'voluptatem dolor itaque',
      'saepe animi consequuntur',
      'facilis adipisci mollitia',
      'veniam quaerat adipisci'
    ],
    keyHighlight: false,
    featureImage: '53ee15b1-60c7-481a-8da3-3409bfdfa502.jpeg:Basketball Court'
  },
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1265,
    featureCategory: 'Computers',
    featureName: 'Smart Locks',
    featureList: [
      'iure facilis hic',
      'occaecati et placeat',
      'sed natus excepturi',
      'non ad vel'
    ],
    keyHighlight: false,
    featureImage: '7c393ece-6cd0-4d7a-a933-a59aaf8d253d.jpeg:Smart Locks'
  },
  {
    projectId: '8ac39c65-298c-4476-9aa8-3edf8a03644f',
    projectName: '96 Tagore',
    featureCategoryId: 1256,
    featureCategory: 'Apartment Amenities',
    featureName: 'Movie Screening Room',
    featureList: [
      'beatae fuga distinctio',
      'amet repellendus ipsa',
      'reprehenderit sunt nesciunt'
    ],
    keyHighlight: false,
    featureImage: '511e0ff5-e6fd-4452-8f12-5e20f564e0a7.jpeg:Movie Screening Room'
  }
];

export const mockProjectStatusesData: FieldChoiceInterface[] = [
  {
    text: 'Ready to Move',
    value: '1'
  },
  {
    text: 'Under Construction',
    value: '2'
  },
  {
    text: 'Newly Launched',
    value: '3'
  }
];

export const mockTransformedResponseFromTransformer = {
  name: '96 Tagore',
  description: 'Harum ipsam officiis veniam at eos corporis hic inventore esse.',
  images: [
    {
      url: `${config.DIRECTUS_URL}/assets/060a8527-5a60-4d94-8daf-2722f0e45067.jpeg`,
      alt: '96 Tagore'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/87347882-25fd-4bf0-af6c-f385a41de22b.jpeg`,
      alt: '96 Tagore'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/a3cf1c56-52bd-4734-b370-7a0d91dabb46.jpeg`,
      alt: '96 Tagore'
    }
  ],
  brochureUrl: `${config.DIRECTUS_URL}/assets/1026434e-a100-42e1-abda-5c88410b4972.pdf`,
  reraRegistrationNumbers: [
    'TEST87465/ 54883'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/32257f0d-e97b-4412-92ef-df975618a315.jpeg`,
    alt: '96 Tagore'
  },
  launchStatus: 'Ready to Move',
  priceRange: {
    min: 43464704
  },
  locality: {
    name: 'East Karlhaven',
    slug: undefined
  },
  message: undefined,
  furnishingLevel: undefined,
  propertyType: 'NEW',
  hidePrice: false,
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 1,
    max: 1,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 1188,
    max: 1188,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/060a8527-5a60-4d94-8daf-2722f0e45067.jpeg`,
      alt: '96 Tagore'
    },
    imageUrl: ''
  },
  customMap: {
    alt: '',
    url: ''
  },
  developer: {
    name: 'SSD Ventures',
    slug: 'SSD-Ventures',
    website: 'https://www.SSD-Ventures.org',
    address: {
      line1: '43539 Irving Station',
      line2: 'Apt. 770',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400580'
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/7afb9b79-d626-49b8-a6b5-83bdca8b5c1e.jpeg`,
      alt: '96 Tagore'
    }
  },
  completionDate: '2021-09-30T00:00:00.000Z',
  configurations: [
    {
      bedrooms: 1,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Block A',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 5,
          carpetArea: {
            area: 1188,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/07d5ee28-f23f-4e85-a56b-eff9149eda93.jpeg`,
            alt: 'Block A'
          }
        }
      ]
    }
  ],
  floorPlans: [
    {
      alt: '96 Tagore',
      url: `${config.DIRECTUS_URL}/assets/87347882-25fd-4bf0-af6c-f385a41de22b.jpeg`
    },
    {
      alt: '96 Tagore',
      url: `${config.DIRECTUS_URL}/assets/a3cf1c56-52bd-4734-b370-7a0d91dabb46.jpeg`
    }
  ],
  featureCategories: [
    {
      category: {
        id: '1256',
        label: 'Apartment Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/511e0ff5-e6fd-4452-8f12-5e20f564e0a7.jpeg`,
            alt: 'Movie Screening Room'
          },
          title: 'Movie Screening Room',
          subFeatures: [
            'beatae fuga distinctio',
            'amet repellendus ipsa',
            'reprehenderit sunt nesciunt'
          ]
        }
      ]
    },
    {
      category: {
        id: '1258',
        label: 'Outdoors'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/f5b96616-e23d-4682-bc7a-0f221d08edfa.jpeg`,
            alt: 'Pet Wash Station'
          },
          title: 'Pet Wash Station',
          subFeatures: [
            'nemo vero ex',
            'ratione nulla asperiores'
          ]
        }
      ]
    },
    {
      category: {
        id: '1262',
        label: 'Kids'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/53ee15b1-60c7-481a-8da3-3409bfdfa502.jpeg`,
            alt: 'Basketball Court'
          },
          title: 'Basketball Court',
          subFeatures: [
            'voluptatem dolor itaque',
            'saepe animi consequuntur',
            'facilis adipisci mollitia',
            'veniam quaerat adipisci'
          ]
        }
      ]
    },
    {
      category: {
        id: '1265',
        label: 'Computers'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/b5098c76-6b0f-4564-8ad4-0ca5e08d09d0.jpeg`,
            alt: 'Walk-in Closets'
          },
          title: 'Walk-in Closets',
          subFeatures: [
            'illum consequatur quibusdam',
            'distinctio pariatur excepturi',
            'recusandae ipsa aliquam',
            'excepturi sunt harum'
          ]
        },
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/7c393ece-6cd0-4d7a-a933-a59aaf8d253d.jpeg`,
            alt: 'Smart Locks'
          },
          title: 'Smart Locks',
          subFeatures: [
            'iure facilis hic',
            'occaecati et placeat',
            'sed natus excepturi',
            'non ad vel'
          ]
        }
      ]
    },
    {
      category: {
        id: '1272',
        label: 'Tools'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/6845986b-0345-40a2-a400-eeb3213980f7.png`,
            alt: 'Metro'
          },
          title: 'Metro',
          subFeatures: [
            'adipisci quisquam suscipit',
            'quae harum consequuntur',
            'sint dignissimos officiis',
            'molestiae perferendis quasi',
            'numquam quos incidunt'
          ]
        }
      ]
    }
  ],
  keyHighlights: [
    {
      image: {
        url: `${config.DIRECTUS_URL}/assets/f5b96616-e23d-4682-bc7a-0f221d08edfa.jpeg`,
        alt: 'Pet Wash Station'
      },
      title: 'Pet Wash Station'
    }
  ]
};

export const sampleFeatures = [
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'On-site Retail',
    featureList: [
      'molestias laboriosam perferendis',
      'ducimus nobis enim',
      'laboriosam sunt inventore'
    ],
    keyHighlight: false,
    featureImage: '930bc9e5-aa87-447a-818c-5d3a2e6f7229.jpeg:On-site Retail'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 3,
    featureCategory: 'Connectivities',
    featureName: '24/7 Maintenance',
    featureList: [
      'praesentium dolores explicabo',
      'voluptatum officiis consequuntur',
      'provident inventore occaecati',
      'sed a tempora'
    ],
    keyHighlight: false,
    featureImage: '9112088e-39bf-4ec8-bac7-d3fab8f9a4fb.jpeg:24/7 Maintenance'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 2,
    featureCategory: 'Apartment Amenities',
    featureName: 'Highway',
    featureList: [
      'similique dolore suscipit',
      'mollitia rerum optio',
      'sapiente voluptatibus voluptatum',
      'nesciunt maxime veritatis',
      'ullam unde ratione'
    ],
    keyHighlight: false,
    featureImage: '984eb335-59ce-4de4-a5c7-23ff5125ed48.jpeg:Highway'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'Bar or Lounge Area',
    featureList: [
      'nemo rem delectus',
      'adipisci perferendis optio',
      'quasi voluptatum quos'
    ],
    keyHighlight: false,
    featureImage: '5f247a30-e5af-4ea0-ad3d-b6fe02187336.jpeg:Bar or Lounge Area'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'Coffee Bar',
    featureList: [
      'et molestiae dicta',
      'illo hic omnis',
      'voluptas assumenda reiciendis',
      'culpa iste voluptate',
      'doloremque quam quisquam'
    ],
    keyHighlight: false,
    featureImage: 'fbf51210-df91-4c9f-90e9-c82d08668311.jpeg:Coffee Bar'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 3,
    featureCategory: 'Connectivities',
    featureName: 'Community Lounge',
    featureList: [
      'minima asperiores aliquid',
      'nemo eaque dicta',
      'mollitia explicabo non'
    ],
    keyHighlight: false,
    featureImage: 'dc0600f4-9d5d-4891-a6a6-496a1b404d1b.jpeg:Community Lounge'
  },
  {
    projectId: '8380d10e-6f4c-495f-9883-a33b716ce8d6',
    projectName: '10 Square',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'Bike Lanes and Bike Sharing Stations',
    featureList: [
      'cum inventore officiis',
      'totam sapiente sint',
      'repellat assumenda at',
      'quasi maiores ab'
    ],
    keyHighlight: false,
    featureImage: '4715e951-9a33-4228-b345-e4676652ceea.jpeg:Bike Lanes and Bike Sharing Stations'
  }
];

export const mockProjectDetail: ProjectDetailInterface = {
  projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
  projectName: '127 Upper East',
  projectSlug: '127-upper-east',
  projectDescription: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  projectTitle: null,
  projectPicture: '2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg:127 Upper East',
  images: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East,'
    + '33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg:127 Upper East',
  floorPlans: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East,'
    + '33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg:127 Upper East',
  customMap: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East',
  projectPlan: '88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg:127 Upper East',
  brochure: '760bcd3c-9b1b-4851-9710-d7500d788a85.pdf',
  launchStatus: 'OC_RECEIVED',
  hidePrice: false,
  minimumPrice: 179649950,
  maximumPrice: 332904580,
  reraRegistrationNumbers: 'TEST42807/49300,TEST52738/98066',
  houseType: 'Beds',
  minimumBedrooms: 2,
  maximumBedrooms: 3,
  minimumBathrooms: 1,
  maximumBathrooms: 5,
  minimumCarpetArea: 9526,
  maximumCarpetArea: 18622,
  areaUnit: 'sq. ft.',
  locality: 'Santacruz(E)',
  latitude: 19.0760,
  longitude: 72.8777,
  developerName: 'Paranjape Schemes',
  developerSlug: 'paranjape-schemes',
  developerWebsite: 'https://www.Paranjape-Schemes.org',
  developerLogo: '1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg:Paranjape Schemes',
  developerAddressLine1: '968 Laura Trail',
  developerAddressLine2: 'Apt. 987',
  developerAddressCity: 'Mumbai',
  developerAddressState: 'Maharashtra',
  developerAddressPinCode: '400431',
  threeSixtyImage: null
};

export const mockWingsConfigurationsData: WingConfigurationInterface[] = [
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    wingName: 'Tower A',
    completionDate: '2021-09-30',
    configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    configurationName: '3BHK',
    projectStatus: '1',
    floorPlan: '2624a828-1d42-4a5f-804e-c5aa422d66f0.jpeg:Tower A',
    bedrooms: 3,
    houseType: 'Beds',
    bathrooms: 1,
    carpetArea: 18622,
    areaUnit: 'sq. ft.'
  },
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    wingName: 'Tower B',
    completionDate: '2021-09-30',
    configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    configurationName: '2BHK',
    projectStatus: '1',
    floorPlan: '8761e8d0-3454-495a-8164-609d3a9fdfeb.jpeg:Tower B',
    bedrooms: 2,
    houseType: 'Beds',
    bathrooms: 5,
    carpetArea: 9526,
    areaUnit: 'sq. ft.'
  }
];

export const mockFeaturesData = [
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    projectName: '127 Upper East',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'Observatory',
    featureList: [
      'dicta ut maiores',
      'consectetur tenetur illo',
      'molestiae porro quos'
    ],
    keyHighlight: true,
    featureImage: '69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg:Observatory'
  },
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    projectName: '127 Upper East',
    featureCategoryId: 3,
    featureCategory: 'Connectivities',
    featureName: 'Public Transportation Access (Bus, Train, Subway)',
    featureList: [
      'natus commodi hic',
      'pariatur illum corrupti',
      'architecto facere eligendi',
      'laborum asperiores qui',
      'natus magnam numquam'
    ],
    keyHighlight: false,
    featureImage: 'b18801c2-3c7e-4b6e-82cb-843bf35b2ba0.jpeg:Public Transportation Access (Bus, Train, Subway)'
  },
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    projectName: '127 Upper East',
    featureCategoryId: 2,
    featureCategory: 'Apartment Amenities',
    featureName: 'Smart Home Technology',
    featureList: [
      'soluta voluptatibus dolore',
      'debitis reprehenderit repudiandae',
      'placeat eveniet commodi',
      'explicabo repellat quis'
    ],
    keyHighlight: false,
    featureImage: 'fd966953-3f20-42f9-868e-d1dd82eec4b8.jpeg:Smart Home Technology'
  }
];

export const expectedProjectDetailWithoutFeatures: ProjectDetail = {
  name: '127 Upper East',
  description: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  furnishingLevel: undefined,
  message: '',
  images: [
    {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`,
      alt: '127 Upper East'
    }
  ],
  brochureUrl: `${config.DIRECTUS_URL}/assets/760bcd3c-9b1b-4851-9710-d7500d788a85.pdf`,
  reraRegistrationNumbers: [
    'TEST42807/49300',
    'TEST52738/98066'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg`,
    alt: '127 Upper East'
  },
  launchStatus: 'Ready to Move',
  hidePrice: false,
  priceRange: {
    min: 179649950
  },
  locality: {
    name: 'Santacruz(E)'
  },
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 2,
    max: 3,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 9526,
    max: 18622,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    imageUrl: ''
  },
  customMap: {
    alt: '127 Upper East',
    url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
  },
  developer: {
    name: 'Paranjape Schemes',
    slug: 'paranjape-schemes',
    website: 'https://www.Paranjape-Schemes.org',
    address: {
      line1: '968 Laura Trail',
      line2: 'Apt. 987',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400431'
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg`,
      alt: 'Paranjape Schemes'
    }
  },
  completionDate: '2021-09-30T00:00:00.000Z',
  configurations: [
    {
      bedrooms: 3,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower A',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 1,
          carpetArea: {
            area: 18622,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/2624a828-1d42-4a5f-804e-c5aa422d66f0.jpeg`,
            alt: 'Tower A'
          }
        }
      ]
    },
    {
      bedrooms: 2,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower B',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 5,
          carpetArea: {
            area: 9526,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/8761e8d0-3454-495a-8164-609d3a9fdfeb.jpeg`,
            alt: 'Tower B'
          }
        }
      ]
    }
  ],
  floorPlans: [
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
    },
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`
    }
  ],
  featureCategories: [],
  keyHighlights: []
};

export const expectedProjectDetailWithoutWingConfig: ProjectDetail = {
  name: '127 Upper East',
  description: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  images: [
    {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`,
      alt: '127 Upper East'
    }
  ],
  brochureUrl: `${config.DIRECTUS_URL}/assets/760bcd3c-9b1b-4851-9710-d7500d788a85.pdf`,
  reraRegistrationNumbers: [
    'TEST42807/49300',
    'TEST52738/98066'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg`,
    alt: '127 Upper East'
  },
  furnishingLevel: undefined,
  launchStatus: '',
  hidePrice: false,
  priceRange: {
    min: 179649950
  },
  locality: {
    name: 'Santacruz(E)',
    slug: undefined
  },
  message: '',
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 2,
    max: 3,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 9526,
    max: 18622,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    imageUrl: ''
  },
  customMap: {
    alt: '127 Upper East',
    url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
  },
  developer: {
    name: 'Paranjape Schemes',
    slug: 'paranjape-schemes',
    website: 'https://www.Paranjape-Schemes.org',
    address: {
      line1: '968 Laura Trail',
      line2: 'Apt. 987',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400431'
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg`,
      alt: 'Paranjape Schemes'
    }
  },
  completionDate: '',
  configurations: [],
  floorPlans: [
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
    },
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`
    }
  ],
  featureCategories: [
    {
      category: {
        id: '1',
        label: 'Leisure Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
            alt: 'Observatory'
          },
          title: 'Observatory',
          subFeatures: [
            'dicta ut maiores',
            'consectetur tenetur illo',
            'molestiae porro quos'
          ]
        }
      ]
    },
    {
      category: {
        id: '2',
        label: 'Apartment Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/fd966953-3f20-42f9-868e-d1dd82eec4b8.jpeg`,
            alt: 'Smart Home Technology'
          },
          title: 'Smart Home Technology',
          subFeatures: [
            'soluta voluptatibus dolore',
            'debitis reprehenderit repudiandae',
            'placeat eveniet commodi',
            'explicabo repellat quis'
          ]
        }
      ]
    },
    {
      category: {
        id: '3',
        label: 'Connectivities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/b18801c2-3c7e-4b6e-82cb-843bf35b2ba0.jpeg`,
            alt: 'Public Transportation Access (Bus, Train, Subway)'
          },
          title: 'Public Transportation Access (Bus, Train, Subway)',
          subFeatures: [
            'natus commodi hic',
            'pariatur illum corrupti',
            'architecto facere eligendi',
            'laborum asperiores qui',
            'natus magnam numquam'
          ]
        }
      ]
    }
  ],
  keyHighlights: [
    {
      image: {
        url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
        alt: 'Observatory'
      },
      title: 'Observatory'
    }
  ]
};

export const inputConfigurations: WingConfigurationInterface[] = [
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    completionDate: '2020-12-31',
    configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    configurationName: '3BHK',
    bedrooms: 1,
    houseType: 'Beds',
    wingName: 'Block A',
    projectStatus: '1',
    bathrooms: 2,
    carpetArea: 800,
    areaUnit: 'sq. ft.',
    floorPlan: 'floor-plan-a.jpg:Block A'
  }
];

export const expectedConfigurations = [
  {
    bedrooms: 1,
    houseType: 'Beds',
    wingsConfigurations: [
      {
        wing: {
          name: 'Block A',
          reraStage: '',
          completionDate: '2020-12-31T00:00:00.000Z'
        },
        bathrooms: 2,
        carpetArea: {
          area: 800,
          unit: 'sq. ft.'
        },
        configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
        floorPlan: {
          url: `${config.DIRECTUS_URL}/assets/floor-plan-a.jpg`,
          alt: 'Block A'
        }
      }
    ]
  }
];

export const expectedFeatureCategories = [
  {
    category: {
      id: '1',
      label: 'Leisure Amenities'
    },
    features: [
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/930bc9e5-aa87-447a-818c-5d3a2e6f7229.jpeg`,
          alt: 'On-site Retail'
        },
        title: 'On-site Retail',
        subFeatures: [
          'molestias laboriosam perferendis',
          'ducimus nobis enim',
          'laboriosam sunt inventore'
        ]
      },
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/5f247a30-e5af-4ea0-ad3d-b6fe02187336.jpeg`,
          alt: 'Bar or Lounge Area'
        },
        title: 'Bar or Lounge Area',
        subFeatures: [
          'nemo rem delectus',
          'adipisci perferendis optio',
          'quasi voluptatum quos'
        ]
      },
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/fbf51210-df91-4c9f-90e9-c82d08668311.jpeg`,
          alt: 'Coffee Bar'
        },
        title: 'Coffee Bar',
        subFeatures: [
          'et molestiae dicta',
          'illo hic omnis',
          'voluptas assumenda reiciendis',
          'culpa iste voluptate',
          'doloremque quam quisquam'
        ]
      },
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/4715e951-9a33-4228-b345-e4676652ceea.jpeg`,
          alt: 'Bike Lanes and Bike Sharing Stations'
        },
        title: 'Bike Lanes and Bike Sharing Stations',
        subFeatures: [
          'cum inventore officiis',
          'totam sapiente sint',
          'repellat assumenda at',
          'quasi maiores ab'
        ]
      }
    ]
  },
  {
    category: {
      id: '2',
      label: 'Apartment Amenities'
    },
    features: [
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/984eb335-59ce-4de4-a5c7-23ff5125ed48.jpeg`,
          alt: 'Highway'
        },
        title: 'Highway',
        subFeatures: [
          'similique dolore suscipit',
          'mollitia rerum optio',
          'sapiente voluptatibus voluptatum',
          'nesciunt maxime veritatis',
          'ullam unde ratione'
        ]
      }
    ]
  },
  {
    category: {
      id: '3',
      label: 'Connectivities'
    },
    features: [
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/9112088e-39bf-4ec8-bac7-d3fab8f9a4fb.jpeg`,
          alt: '24/7 Maintenance'
        },
        title: '24/7 Maintenance',
        subFeatures: [
          'praesentium dolores explicabo',
          'voluptatum officiis consequuntur',
          'provident inventore occaecati',
          'sed a tempora'
        ]
      },
      {
        image: {
          url: `${config.DIRECTUS_URL}/assets/dc0600f4-9d5d-4891-a6a6-496a1b404d1b.jpeg`,
          alt: 'Community Lounge'
        },
        title: 'Community Lounge',
        subFeatures: [
          'minima asperiores aliquid',
          'nemo eaque dicta',
          'mollitia explicabo non'
        ]
      }
    ]
  }
];

export const sampleFeaturesWithKeyHighlight = [
  {
    projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
    projectName: '127 Upper East',
    featureCategoryId: 1,
    featureCategory: 'Leisure Amenities',
    featureName: 'Observatory',
    featureList: [
      'dicta ut maiores',
      'consectetur tenetur illo',
      'molestiae porro quos'
    ],
    keyHighlight: true,
    featureImage: '69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg:Observatory'
  }
];

export const expectedKeyHighlights = [
  {
    image: {
      url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
      alt: 'Observatory'
    },
    title: 'Observatory'
  }
];

export const expectedProjectDetail: ProjectDetail = {
  name: '127 Upper East',
  description: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  images: [
    {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`,
      alt: '127 Upper East'
    }
  ],
  brochureUrl: `${config.DIRECTUS_URL}/assets/760bcd3c-9b1b-4851-9710-d7500d788a85.pdf`,
  reraRegistrationNumbers: [
    'TEST42807/49300',
    'TEST52738/98066'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg`,
    alt: '127 Upper East'
  },
  launchStatus: 'Ready to Move',
  hidePrice: false,
  priceRange: {
    min: 179649950
  },
  locality: {
    name: 'Santacruz(E)',
    slug: undefined
  },
  furnishingLevel: undefined,
  message: '',
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 2,
    max: 3,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 9526,
    max: 18622,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    imageUrl: ''
  },
  customMap: {
    alt: '127 Upper East',
    url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
  },
  developer: {
    name: 'Paranjape Schemes',
    slug: 'paranjape-schemes',
    website: 'https://www.Paranjape-Schemes.org',
    address: {
      line1: '968 Laura Trail',
      line2: 'Apt. 987',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400431'
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg`,
      alt: 'Paranjape Schemes'
    }
  },
  completionDate: '2021-09-30T00:00:00.000Z',
  configurations: [
    {
      bedrooms: 3,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower A',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 1,
          carpetArea: {
            area: 18622,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/2624a828-1d42-4a5f-804e-c5aa422d66f0.jpeg`,
            alt: 'Tower A'
          }
        }
      ]
    },
    {
      bedrooms: 2,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower B',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 5,
          carpetArea: {
            area: 9526,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/8761e8d0-3454-495a-8164-609d3a9fdfeb.jpeg`,
            alt: 'Tower B'
          }
        }
      ]
    }
  ],
  floorPlans: [
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
    },
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`
    }
  ],
  featureCategories: [
    {
      category: {
        id: '1',
        label: 'Leisure Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
            alt: 'Observatory'
          },
          title: 'Observatory',
          subFeatures: [
            'dicta ut maiores',
            'consectetur tenetur illo',
            'molestiae porro quos'
          ]
        }
      ]
    },
    {
      category: {
        id: '2',
        label: 'Apartment Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/fd966953-3f20-42f9-868e-d1dd82eec4b8.jpeg`,
            alt: 'Smart Home Technology'
          },
          title: 'Smart Home Technology',
          subFeatures: [
            'soluta voluptatibus dolore',
            'debitis reprehenderit repudiandae',
            'placeat eveniet commodi',
            'explicabo repellat quis'
          ]
        }
      ]
    },
    {
      category: {
        id: '3',
        label: 'Connectivities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/b18801c2-3c7e-4b6e-82cb-843bf35b2ba0.jpeg`,
            alt: 'Public Transportation Access (Bus, Train, Subway)'
          },
          title: 'Public Transportation Access (Bus, Train, Subway)',
          subFeatures: [
            'natus commodi hic',
            'pariatur illum corrupti',
            'architecto facere eligendi',
            'laborum asperiores qui',
            'natus magnam numquam'
          ]
        }
      ]
    }
  ],
  keyHighlights: [
    {
      image: {
        url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
        alt: 'Observatory'
      },
      title: 'Observatory'
    }
  ]
};

export const mockProjectDetailWithNoImages: ProjectDetailInterface = {
  projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
  projectName: '127 Upper East',
  projectSlug: '127-upper-east',
  projectDescription: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  projectTitle: null,
  projectPicture: '',
  images: '',
  floorPlans: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East,'
    + '33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg:127 Upper East',
  customMap: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East',
  projectPlan: '88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg:127 Upper East',
  brochure: '760bcd3c-9b1b-4851-9710-d7500d788a85.pdf',
  launchStatus: 'OC_RECEIVED',
  hidePrice: false,
  minimumPrice: 179649950,
  maximumPrice: 332904580,
  reraRegistrationNumbers: 'TEST42807/49300,TEST52738/98066',
  houseType: 'Beds',
  minimumBedrooms: 2,
  maximumBedrooms: 3,
  minimumBathrooms: 1,
  maximumBathrooms: 5,
  minimumCarpetArea: 9526,
  maximumCarpetArea: 18622,
  areaUnit: 'sq. ft.',
  locality: 'Santacruz(E)',
  latitude: 19.076,
  longitude: 72.8777,
  developerName: 'Paranjape Schemes',
  developerSlug: 'paranjape-schemes',
  developerWebsite: 'https://www.Paranjape-Schemes.org',
  developerLogo: '1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg:Paranjape Schemes',
  developerAddressLine1: '968 Laura Trail',
  developerAddressLine2: 'Apt. 987',
  developerAddressCity: 'Mumbai',
  developerAddressState: 'Maharashtra',
  developerAddressPinCode: '400431',
  threeSixtyImage: null
};

export const expectedProjectDetailData: ProjectDetail = {
  name: '127 Upper East',
  description: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  images: [],
  completionDate: '2021-09-30T00:00:00.000Z',
  brochureUrl: `${config.DIRECTUS_URL}/assets/760bcd3c-9b1b-4851-9710-d7500d788a85.pdf`,
  reraRegistrationNumbers: [
    'TEST42807/49300',
    'TEST52738/98066'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg`,
    alt: '127 Upper East'
  },
  launchStatus: 'Ready to Move',
  hidePrice: false,
  priceRange: {
    min: 179649950
  },
  locality: {
    name: 'Santacruz(E)',
    slug: undefined
  },
  furnishingLevel: undefined,
  message: '',
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 2,
    max: 3,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 9526,
    max: 18622,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: '',
      alt: ''
    },
    imageUrl: ''
  },
  customMap: {
    alt: '127 Upper East',
    url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
  },
  developer: {
    name: 'Paranjape Schemes',
    slug: 'paranjape-schemes',
    website: 'https://www.Paranjape-Schemes.org',
    address: {
      line1: '968 Laura Trail',
      line2: 'Apt. 987',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400431'
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg`,
      alt: 'Paranjape Schemes'
    }
  },
  configurations: [
    {
      bedrooms: 3,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower A',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 1,
          carpetArea: {
            area: 18622,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/2624a828-1d42-4a5f-804e-c5aa422d66f0.jpeg`,
            alt: 'Tower A'
          }
        }
      ]
    },
    {
      bedrooms: 2,
      houseType: 'Beds',
      wingsConfigurations: [
        {
          wing: {
            name: 'Tower B',
            reraStage: 'Ready to Move',
            completionDate: '2021-09-30T00:00:00.000Z'
          },
          bathrooms: 5,
          carpetArea: {
            area: 9526,
            unit: 'sq. ft.'
          },
          configurationId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
          floorPlan: {
            url: `${config.DIRECTUS_URL}/assets/8761e8d0-3454-495a-8164-609d3a9fdfeb.jpeg`,
            alt: 'Tower B'
          }
        }
      ]
    }
  ],
  floorPlans: [
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
    },
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`
    }
  ],
  featureCategories: [
    {
      category: {
        id: '1',
        label: 'Leisure Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
            alt: 'Observatory'
          },
          title: 'Observatory',
          subFeatures: [
            'dicta ut maiores',
            'consectetur tenetur illo',
            'molestiae porro quos'
          ]
        }
      ]
    },
    {
      category: {
        id: '2',
        label: 'Apartment Amenities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/fd966953-3f20-42f9-868e-d1dd82eec4b8.jpeg`,
            alt: 'Smart Home Technology'
          },
          title: 'Smart Home Technology',
          subFeatures: [
            'soluta voluptatibus dolore',
            'debitis reprehenderit repudiandae',
            'placeat eveniet commodi',
            'explicabo repellat quis'
          ]
        }
      ]
    },
    {
      category: {
        id: '3',
        label: 'Connectivities'
      },
      features: [
        {
          image: {
            url: `${config.DIRECTUS_URL}/assets/b18801c2-3c7e-4b6e-82cb-843bf35b2ba0.jpeg`,
            alt: 'Public Transportation Access (Bus, Train, Subway)'
          },
          title: 'Public Transportation Access (Bus, Train, Subway)',
          subFeatures: [
            'natus commodi hic',
            'pariatur illum corrupti',
            'architecto facere eligendi',
            'laborum asperiores qui',
            'natus magnam numquam'
          ]
        }
      ]
    }
  ],
  keyHighlights: [
    {
      image: {
        url: `${config.DIRECTUS_URL}/assets/69f0a851-5e7d-4688-9988-6f5be9c9f1e6.jpeg`,
        alt: 'Observatory'
      },
      title: 'Observatory'
    }
  ]
};

export const mockProjectDetailWithNoDeveloperAddress: ProjectDetailInterface = {
  projectId: '99e06a83-5538-46e3-a80f-4e40e4b1d926',
  projectName: '127 Upper East',
  projectSlug: '127-upper-east',
  projectDescription: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  projectTitle: null,
  projectPicture: '2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg:127 Upper East',
  images: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East,'
  + '33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg:127 Upper East',
  floorPlans: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East,'
  + '33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg:127 Upper East',
  customMap: '1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg:127 Upper East',
  projectPlan: '88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg:127 Upper East',
  brochure: '760bcd3c-9b1b-4851-9710-d7500d788a85.pdf',
  launchStatus: 'OC_RECEIVED',
  hidePrice: false,
  minimumPrice: 179649950,
  maximumPrice: 332904580,
  reraRegistrationNumbers: 'TEST42807/49300,TEST52738/98066',
  houseType: 'Beds',
  minimumBedrooms: 2,
  maximumBedrooms: 3,
  minimumBathrooms: 1,
  maximumBathrooms: 5,
  minimumCarpetArea: 9526,
  maximumCarpetArea: 18622,
  areaUnit: 'sq. ft.',
  locality: 'Santacruz(E)',
  latitude: 19.076,
  longitude: 72.8777,
  developerName: 'Paranjape Schemes',
  developerSlug: 'paranjape-schemes',
  developerWebsite: 'https://www.Paranjape-Schemes.org',
  developerLogo: '1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg:Paranjape Schemes',
  developerAddressLine1: '',
  developerAddressLine2: '',
  developerAddressCity: '',
  developerAddressState: '',
  developerAddressPinCode: '',
  threeSixtyImage: null
};

export const expectedProjectDetailWithoutDeveloperAddress: ProjectDetail = {
  name: '127 Upper East',
  description: 'Fugiat suscipit non quos architecto ad nostrum doloribus aperiam sit.',
  propertyType: 'NEW',
  images: [
    {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`,
      alt: '127 Upper East'
    },
    {
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`,
      alt: '127 Upper East'
    }
  ],
  brochureUrl: `${config.DIRECTUS_URL}/assets/760bcd3c-9b1b-4851-9710-d7500d788a85.pdf`,
  reraRegistrationNumbers: [
    'TEST42807/49300',
    'TEST52738/98066'
  ],
  projectPlan: {
    url: `${config.DIRECTUS_URL}/assets/88dbf39c-2a49-439d-bf17-f00b40878aaf.jpeg`,
    alt: '127 Upper East'
  },
  launchStatus: '',
  hidePrice: false,
  priceRange: {
    min: 179649950
  },
  locality: {
    name: 'Santacruz(E)',
    slug: undefined
  },
  message: '',
  furnishingLevel: undefined,
  geoLocation: {
    latitude: 19.0760,
    longitude: 72.8777
  },
  bedrooms: {
    min: 2,
    max: 3,
    houseType: 'Beds'
  },
  carpetArea: {
    min: 9526,
    max: 18622,
    unit: 'sq. ft.'
  },
  threeSixtyImage: {
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/2e2f47f6-f88a-4d0c-91d0-66e856693906.jpeg`,
      alt: '127 Upper East'
    },
    imageUrl: ''
  },
  customMap: {
    alt: '127 Upper East',
    url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
  },
  developer: {
    name: 'Paranjape Schemes',
    slug: 'paranjape-schemes',
    website: 'https://www.Paranjape-Schemes.org',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    thumbnail: {
      url: `${config.DIRECTUS_URL}/assets/1fa602d0-45e8-4507-992e-8fb83e8e5b17.jpeg`,
      alt: 'Paranjape Schemes'
    }
  },
  completionDate: '',
  configurations: [],
  floorPlans: [
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/1b23af74-dfb5-433d-b285-fb09eb173f34.jpeg`
    },
    {
      alt: '127 Upper East',
      url: `${config.DIRECTUS_URL}/assets/33a9aaef-f573-4043-a441-c4aaf0cfd007.jpeg`
    }
  ],
  featureCategories: [],
  keyHighlights: []
};
