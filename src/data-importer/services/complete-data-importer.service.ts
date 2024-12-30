import { Injectable } from '@nestjs/common';
import * as wkx from 'wkx';
import { MicroMarket } from '../interfaces/micro-market.interface';
import { Project } from '../interfaces/project.interface';

@Injectable()
export class CompleteDataImporterService {
  mergeData(projectExcelData: Project[], microMarketExcelData: MicroMarket[]) {
    if (!projectExcelData || !microMarketExcelData) {
      return projectExcelData;
    }
    return projectExcelData.map((project) => {
      const matchedMicroMarket = microMarketExcelData.find(
        (microMarket) => microMarket.projectname === project.projectname
      );
      if (matchedMicroMarket) {
        project.latitude = matchedMicroMarket.latitude;
        project.longitude = matchedMicroMarket.longitude;
        project.geolocation = this.convertToWkb(matchedMicroMarket.latitude, matchedMicroMarket.longitude);
      }
      return project;
    });
  }

  private convertToWkb(latitude: number, longitude: number) {
    const constantSridHex = '20E61000';
    const wktWithSRID = `SRID=4326;POINT(${longitude} ${latitude})`;
    const point = wkx.Geometry.parse(wktWithSRID);
    const wkbHex = point.toWkb().toString('hex').toUpperCase();
    return wkbHex.slice(0, 8) + constantSridHex + wkbHex.slice(8);
  }
}
