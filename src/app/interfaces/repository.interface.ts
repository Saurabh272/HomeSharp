export interface IRepository {
  getById?(id: string): Promise<any>;

  create?(data: any): Promise<any>;

  updateById?(id: string, data: any): Promise<any>;

  deleteById?(id: string): Promise<any>;
}
