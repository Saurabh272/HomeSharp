import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  createClient,
  Photo,
  PhotosWithTotalResults,
  ErrorResponse
} from 'pexels';
import config from '../../app/config';

@Injectable()
export class ImageGenerator {
  private readonly pexelApiKey = config.PEXELS_API_KEY;

  async getRandomImageUrl(query: string) {
    const client = createClient(this.pexelApiKey);
    const searchResponse: PhotosWithTotalResults | ErrorResponse = await client.photos.search({
      query,
      per_page: 1,
      page: Math.floor(Math.random() * 100) + 1
    });

    if ('photos' in searchResponse) {
      if (searchResponse.photos.length > 0) {
        const image: Photo = searchResponse.photos[0];
        const response = await axios.get(image.src.large2x, { responseType: 'arraybuffer' });
        const url = image.src.large;
        return {
          url,
          data: response.data,
          name: url.split('?')[0].split('/').pop()
        };
      }
      throw new Error('No images found for the specified query');
    } else {
      throw new Error('Error response received from Pexels API');
    }
  }
}
