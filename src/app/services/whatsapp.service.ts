import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import { WhatsappRepository } from '../repositories/whatsapp.repository';
import { Whatsapp } from '../types/whatsapp.type';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly whatsappRepository: WhatsappRepository
  ) {}

  async whatsappTemplates(data: Whatsapp): Promise<string> {
    const whatsappData = await this.whatsappRepository.getWhatsappTemplates(data?.type);
    const parsedTemplate: HandlebarsTemplateDelegate = Handlebars.compile(whatsappData?.templates);

    return parsedTemplate({ ...data });
  }
}
