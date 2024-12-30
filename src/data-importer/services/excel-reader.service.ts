import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as dayjs from 'dayjs';
import { ReadRowParam } from '../interfaces/read-row-param.interface';
import { DataImportPayload } from '../dto/data-import-payload.dto';

@Injectable()
export class ExcelReaderService {
  private readonly UPLOAD_PATH = path.join(__dirname, '..', 'uploads');

  private readonly logger = new Logger(ExcelReaderService.name);

  async processExcelData(file: Express.Multer.File, payload: DataImportPayload) {
    if (!file) {
      return [];
    }
    const { startRow, endRow } = payload;
    if (startRow && endRow) {
      if (+startRow < 2 || +endRow < 2) {
        throw new Error('Start Row and End Row should be greater than 1');
      }
      if (+startRow > +endRow) {
        throw new Error('Start Row should be less than or equal to End Row');
      }
      this.logger.log(`Processing Excel Data from row ${startRow} to ${endRow}`);
    }

    const filePath = await this.saveFile(file);

    return this.readExcelData(filePath, +startRow || 2, +endRow || 0);
  }

  private async saveFile(file: Express.Multer.File): Promise<string> {
    const timestamp: number = Date.now();
    const filename = `excel_${timestamp}_${file.originalname}`;
    const filePath = path.join(this.UPLOAD_PATH, filename);
    const buffer = Buffer.from(file.buffer);

    try {
      await fs.outputFile(filePath, buffer);
      this.logger.log(`File saved to: ${filePath}`);
      return filePath;
    } catch (err) {
      throw new Error(`Error saving file: ${err.message}`);
    }
  }

  private async readExcelData(filePath: string, startRow: number, endRow: number): Promise<any[]> {
    const { SheetNames, Sheets } = XLSX.readFile(filePath);
    const worksheet = Sheets[SheetNames[0]];

    if (!worksheet['!ref']) {
      throw new BadRequestException('Invalid Excel File');
    }

    const worksheetDataRange: XLSX.Range = XLSX.utils.decode_range(worksheet['!ref']);
    const rangeEndRow = worksheetDataRange.e.r;
    const rangeStartColumn = worksheetDataRange.s.c;
    const rangeEndColumn = worksheetDataRange.e.c;

    if (rangeEndRow < 1) {
      throw new BadRequestException('Excel File is empty');
    }

    if (endRow === 0) {
      endRow = rangeEndRow + 1;
    }

    if (endRow < startRow) {
      throw new BadRequestException('End Row is less than Start Row');
    }

    const columnNames = this.readColumnNames(worksheet, rangeStartColumn, rangeEndColumn);
    return this.readRows({
      worksheet, columnNames, startRow, endRow, rangeStartColumn, rangeEndColumn
    });
  }

  private readColumnNames(sheet: XLSX.WorkSheet, rangeStartColumn: number, rangeEndColumn: number): string[] {
    return Array.from({ length: rangeEndColumn - rangeStartColumn + 1 }, (_, colNum) => {
      const cellValue = sheet[XLSX.utils.encode_cell({ r: 0, c: colNum + rangeStartColumn })]?.v;
      return this.cleanColumnName(cellValue);
    });
  }

  private cleanColumnName(name: string | undefined): string | null {
    return name ? name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : null;
  }

  private readRows(params: ReadRowParam): any[] {
    const {
      worksheet, startRow, columnNames, endRow, rangeStartColumn, rangeEndColumn
    } = params;

    const dateColumns = ['launchdate', 'completiondate'];
    const data = [];

    for (let rowNum = startRow; rowNum <= endRow; rowNum += 1) {
      const rowData = {};

      for (let colNum = rangeStartColumn; colNum <= rangeEndColumn; colNum += 1) {
        const columnName = columnNames[colNum];
        const cellRange = XLSX.utils.encode_cell({ r: rowNum - 1, c: colNum });
        let cellValue = worksheet[cellRange]?.v;
        if (typeof cellValue === 'string') {
          cellValue = cellValue
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ');
          cellValue = cellValue.trim();
        }

        rowData[columnName] = dateColumns.includes(columnName.toLowerCase())
          ? this.readDate(cellValue)
          : cellValue || null;
      }

      data.push(rowData);
    }

    return data;
  }

  private readDate(date: any): string | Date | null {
    if (typeof date === 'number') {
      return this.convertExcelDateToISO(XLSX.SSF.parse_date_code(date));
    }
    const formattedDate = dayjs(date, 'D-M-YYYY');

    if (formattedDate.isValid()) {
      return formattedDate.toDate();
    }
    return null;
  }

  private convertExcelDateToISO(excelDate: any): string {
    const utcDate = new Date(Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d));
    return utcDate.toISOString();
  }
}
