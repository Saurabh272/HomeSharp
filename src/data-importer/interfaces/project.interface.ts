export interface Project {
  absorbedunits?: number;
  bedroommax?: number;
  bedroommin?: number;
  completiondate?: any;
  constructionstage?: string;
  crmprice?: number;
  crmpriceason?: number;
  crmpricebasedon?: number;
  currentstatus?: string;
  delaymonths?: string;
  delaymonths1?: number;
  developer?: string;
  isbuilderdistress?: string;
  infodate?: any;
  lqpricerssqftmax?: number;
  lqpricerssqftmin?: number;
  launchedsqft?: number;
  launchedunits?: number;
  launchdate?: any;
  location?: string;
  micromarket?: string;
  newlaunchprice?: number;
  phase?: string;
  pricebasedon?: string;
  priceinclusive?: string;
  projectname: string;
  projectsubtype?: string;
  projecttype?: string;
  propertysegment?: string;
  regionname?: string;
  regnooftransactions?: number;
  regprice?: number;
  regpriceason?: number;
  regtotalarea?: number;
  regtotalvalue?: number;
  resalerssqftmax?: number;
  resalerssqftmin?: number;
  salerssqftmax?: number;
  salerssqftmin?: number;
  sold?: number;
  totalprojsqft?: number;
  totalunits?: number;
  unitizesqftmax?: number;
  unitizesqftmin?: number;
  latitude?: number;
  longitude?: number;
  geolocation?: string;
  wings?: {
    min: number;
    max: number;
  }
}
