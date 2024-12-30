import config from '../../app/config';

export const mockDeveloper = {
  developerId: '0155772d-4e13-4fb6-813b-03f8fc49763b',
  developerName: 'Masakin Developers',
  developerSlug: 'masakin-developers',
  developerWebsite: 'https://www.masakin-developers.com',
  developerLogo: 'cb3e32f3-9556-43e1-8818-b117ec655892.jpeg:pexels-photo-1571468_watermark',
  developerAddressLine1: '857 Kelsi Gateway',
  developerAddressLine2: 'Apt. 325',
  developerAddressCity: 'Mumbai',
  developerAddressState: 'Maharashtra',
  developerAddressPinCode: '400382',
  developerType: 'DEVELOPER'
};

export const mockTransformedDeveloper = {
  developerId: 'someId',
  name: 'Test Developer',
  address: '123 Main St,Test City,Test State,12345',
  slug: 'test-developer',
  thumbnail: 'http://localhost:8080/assets/test-logo.jpg'
};

export const mockMicroMarket: any = [
  {
    microMarketId: 'id1',
    microMarketName: 'Micro Market 1'
  },
  {
    microMarketId: 'id2',
    microMarketName: 'Micro Market 2'
  }
];

export const mockProjects: any = [
  {
    projectId: 'id1',
    projectName: 'Project 1'
  },
  {
    projectId: 'id2',
    projectName: 'Project 2'
  }
];

export const mockMicroMarketResult: any = [
  {
    microMarketId: 'id',
    microMarketName: 'Sample Micro Market',
    microMarketSlug: 'sample-micro-market',
    latitude: 123.456,
    longitude: 789.012
  }
];

export const mockTransformedMicroMarket: any = {
  microMarketId: 'id',
  name: 'Sample Micro Market',
  slug: 'sample-micro-market',
  coordinates: [123.456, 789.012],
  thumbnail: 'your_mocked_thumbnail_url'
};

export const mockProjectResult: any = [
  [
    {
      projectId: 'b41e51bb-1fc1-4c4a-af75-5d310fb2dc75',
      projectName: 'Rite Fortis',
      projectSlug: 'rite-fortis',
      summary: null,
      projectPicture: 'aea7f68c-d673-4cd4-8b39-48ddcec4f9ae.jpeg:pexels-photo-1457841_watermark',
      images: '8648f491-652f-49dc-9448-634d8cd7f40c.jpeg:pexels-photo-1042594_watermark',
      projectPlan: '9263ba18-9ffe-433a-8807-618c7fc60a96.jpeg:pexels-photo-9052452_watermark',
      brochure: '69a0aa90-e441-4370-93ce-b8c578786631.pdf',
      latitude: 18.596102951904296,
      longitude: 72.95058308763578,
      featured: false,
      mostSearched: true,
      newlyLaunched: true,
      currentStatus: null,
      completionYear: 2023,
      minimumPrice: 159274940,
      maximumPrice: 235434180,
      reraRegistrationNumbers: 'TEST40632/93008',
      houseType: 'Beds',
      minimumBedrooms: 3,
      maximumBedrooms: 3,
      minimumBathrooms: 5,
      maximumBathrooms: 5,
      minimumCarpetArea: 2058,
      maximumCarpetArea: 2058,
      areaUnit: 'sq. ft.',
      localityName: 'Borivali(W)',
      localitySlug: 'BorivaliW',
      microMarket: 'Borivali(W)',
      numberOfUnits: 18,
      numberOfUnitsSold: 17,
      developer: 'Rite Developers',
      developerSlug: 'rite-developers',
      developerWebsite: 'https://www.rite-developers.net',
      developerLogo: '38378897-e35a-44ee-b97d-a4bb51dde03e.jpeg:Pexels Photo 2082087',
      developerAddressLine1: '59398 Rosetta Summit',
      developerAddressLine2: 'Suite 418',
      developerAddressCity: 'Mumbai',
      developerAddressState: 'Maharashtra',
      developerAddressPinCode: '400583',
      categories: 'CarParking,Club House,Infra Dev. Charges',
      categorySlugs: 'carparking,club-house,infra-dev-charges'
    }
  ],
  [
    { text: 'Ready to Move', value: '1' },
    { text: 'Under Construction', value: '2' },
    { text: 'Newly Launched', value: '3' }
  ]
];

export const mockTransformedProject: any = [
  {
    projectId: 'b41e51bb-1fc1-4c4a-af75-5d310fb2dc75',
    projectName: 'Rite Fortis',
    projectSlug: 'rite-fortis',
    developer: 'Rite Developers',
    coordinates: [18.596102951904296, 72.95058308763578],
    latitude: 18.596102951904296,
    longitude: 72.95058308763578,
    microMarket: 'Borivali(W)',
    localityName: 'Borivali(W)',
    localitySlug: 'BorivaliW',
    categories: ['CarParking', 'Club House', 'Infra Dev. Charges'],
    categorySlugs: ['carparking', 'club-house', 'infra-dev-charges'],
    noOfUnits: 18,
    noOfUnitsSold: 17,
    percentageSold: 94.44,
    carpetAreaMin: 2058,
    carpetAreaMax: 2058,
    carpetAreaUnit: 'sq. ft.',
    bedRoomMin: 3,
    bedRoomMax: 3,
    houseType: 'Beds',
    bathRoomMin: 5,
    bathRoomMax: 5,
    priceMin: 159274940,
    priceMax: 235434180,
    address: '59398 Rosetta Summit,Suite 418,Mumbai,Maharashtra,400583',
    currentStatus: '',
    developerSlug: 'rite-developers',
    featured: false,
    mostSearched: true,
    newlyLaunched: true,
    completionYear: 2023,
    images: [
      {
        url: `${config.DIRECTUS_URL}/assets/aea7f68c-d673-4cd4-8b39-48ddcec4f9ae.jpeg`,
        alt: 'pexels-photo-1457841_watermark'
      }],
    thumbnail: `${config.DIRECTUS_URL}/assets/aea7f68c-d673-4cd4-8b39-48ddcec4f9ae.jpeg`
  }
];

export const mockProjectIndexingData: any = {
  projectForIndexing: [
    {
      projectId: '6f2b0b4a-5e5c-4a3f-8e83-e75f62d208b5',
      projectName: 'Sumer Armonia',
      projectSlug: 'sumer-armonia',
      summary: null,
      projectPicture: '7daa4c17-0fdb-4fed-a843-6bb73d5fbed2.pdf:Dummy',
      images: '05db7459-d4c7-4b84-b6a5-c71bc7464a41.jpeg:pexels-photo-4099388_watermark',
      projectPlan: 'a75a248f-29a9-4e7d-9da7-89ff4694f05f.jpeg:pexels-photo-3831159_watermark',
      brochure: '7d377b70-4237-4b28-8c1b-9dbdd189d5dd.pdf',
      latitude: 19.690416163611804,
      longitude: 72.91301186248734,
      featured: false,
      mostSearched: false,
      newlyLaunched: true,
      currentStatus: '2',
      completionDate: '2022-12-01T00:00:00.000Z',
      minimumPrice: 74898240,
      maximumPrice: 139423090,
      reraRegistrationNumbers: 'TEST33229/52771,TEST64126/21500',
      houseType: 'BHK',
      minimumBedrooms: 1,
      maximumBedrooms: 1,
      minimumBathrooms: 2,
      maximumBathrooms: 2,
      minimumCarpetArea: 3190,
      maximumCarpetArea: 3190,
      areaUnit: 'sq. ft.',
      localityName: 'Mazagaon',
      localitySlug: 'Mazagaon',
      microMarket: 'Mazagaon',
      numberOfUnits: 142,
      numberOfUnitsSold: 90,
      developer: 'Sumer Group',
      developerSlug: 'sumer-group',
      developerWebsite: 'https://www.sumer-group.org',
      developerLogo: '18b18199-a411-482a-ac59-52c0bfbccd16.jpeg:Pexels Photo 1036657',
      developerAddressLine1: '69950 Daisy Harbor',
      developerAddressLine2: 'Suite 428',
      developerAddressCity: 'Mumbai',
      developerAddressState: 'Maharashtra',
      developerAddressPinCode: '400450',
      categories: 'CarParking,Club House,Infra Dev. Charges',
      categorySlugs: 'carparking,club-house,infra-dev-charges'
    }
  ],
  projectStatuses: [
    { text: 'Ready to Move', value: '1' },
    { text: 'Under Construction', value: '2' },
    { text: 'Newly Launched', value: '3' }
  ]
};

export const mockProjectIndexingTransformedData = [
  {
    projectId: '6f2b0b4a-5e5c-4a3f-8e83-e75f62d208b5',
    projectName: 'Sumer Armonia',
    projectSlug: 'sumer-armonia',
    developer: 'Sumer Group',
    coordinates: [19.690416163611804, 72.91301186248734],
    latitude: 19.690416163611804,
    longitude: 72.91301186248734,
    microMarket: 'Mazagaon',
    localityName: 'Mazagaon',
    localitySlug: 'Mazagaon',
    categories: ['CarParking', 'Club House', 'Infra Dev. Charges'],
    categorySlugs: ['carparking', 'club-house', 'infra-dev-charges'],
    noOfUnits: 142,
    noOfUnitsSold: 90,
    percentageSold: 63.38,
    carpetAreaMin: 3190,
    carpetAreaMax: 3190,
    carpetAreaUnit: 'sq. ft.',
    bedRoomMin: 1,
    bedRoomMax: 1,
    houseType: 'BHK',
    bathRoomMin: 2,
    bathRoomMax: 2,
    priceMin: 74898240,
    priceMax: 139423090,
    address: '69950 Daisy Harbor,Suite 428,Mumbai,Maharashtra,400450',
    currentStatus: 'Under Construction',
    developerSlug: 'sumer-group',
    featured: false,
    mostSearched: false,
    newlyLaunched: true,
    completionDate: '2022-12-01T00:00:00.000Z',
    images: `[{"url":"${config.DIRECTUS_URL}/assets/7daa4c17-0fdb-4fed-a843-6bb73d5fbed2.pdf","alt":"Dummy"},`
    + `{"url":"${config.DIRECTUS_URL}/assets/05db7459-d4c7-4b84-b6a5-c71bc7464a41.jpeg",`
    + '"alt":"pexels-photo-4099388_watermark"}]',
    thumbnail: `${config.DIRECTUS_URL}/assets/7daa4c17-0fdb-4fed-a843-6bb73d5fbed2.pdf`
  }
];
