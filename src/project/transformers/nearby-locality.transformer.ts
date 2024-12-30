import { Injectable } from '@nestjs/common';
import { ITransformer } from '../../app/interfaces/transformer.interface';
import { NearbyLocalities, NearbyLocality } from '../types/nearby-locality.type';

@Injectable()
export class NearbyLocalityTransformer implements ITransformer {
  process(data: any) {
    if (!data || !data.length) {
      return [];
    }
    const nearbyLocalities: NearbyLocalities = {
      nearbyLocalities: data.map((item: { name: string, projectsCount: number }): NearbyLocality => ({
        name: item.name,
        projectsCount: item.projectsCount
      }))
    };
    return nearbyLocalities;
  }
}
