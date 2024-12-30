import * as XLSX from 'xlsx';

export interface ReadRowParam {
  worksheet: XLSX.WorkSheet;
  columnNames: string[];
  startRow: number;
  endRow: number;
  rangeStartColumn: number;
  rangeEndColumn: number;
}
