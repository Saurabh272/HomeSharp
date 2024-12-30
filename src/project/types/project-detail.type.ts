export type Image = {
  url: string;
  alt: string;
};

export type PriceRange = {
  min: number;
};

type Locality = {
  name: string;
  slug?: string; // TODO remove optional
};

type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type HouseType = 'Beds';

export type AreaUnit = 'sq. ft.';

export type Bedrooms = {
  min: number;
  max: number;
  houseType: HouseType;
};

export type CarpetAreaRange = {
  min: number;
  max: number;
  unit: AreaUnit;
};

export type CarpetArea = {
  area: number;
  unit: AreaUnit;
};

export type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

export type Developer = {
  name: string;
  slug: string;
  website: string;
  address: Address;
  thumbnail: Image;
};

export type Wing = {
  name: string;
  reraStage: string;
  completionDate: string;
};

export type WingConfiguration = {
  wing: Wing;
  configurationId: string;
  bathrooms: number;
  carpetArea: CarpetArea;
  floorPlan: Image;
};

export type Configuration = {
  bedrooms: number;
  houseType: HouseType;
  wingsConfigurations: Array<WingConfiguration>;
};

export type Category = {
  id: string;
  label: string;
};

export type KeyHighlight = {
  image: Image;
  title: string;
};

export type Feature = KeyHighlight & {
  subFeatures: string[];
};

export type FeatureCategory = {
  category: Category;
  features: Array<Feature>;
};

export type ProjectDetail = {
  name: string;
  description: string;
  propertyType: string;
  images: Array<Image>;
  brochureUrl: string;
  launchStatus: string;
  completionDate: string;
  reraRegistrationNumbers: string[];
  hidePrice: boolean;
  priceRange?: PriceRange;
  locality: Locality;
  geoLocation: GeoLocation;
  bedrooms: Bedrooms;
  carpetArea: CarpetAreaRange;
  developer: Developer;
  configurations: Array<Configuration>;
  projectPlan: Image;
  customMap: Image;
  floorPlans: Array<Image>;
  featureCategories: Array<FeatureCategory>;
  keyHighlights: Array<KeyHighlight>;
  threeSixtyImage: object,
  message?: string,
  furnishingLevel?: string[]
};
