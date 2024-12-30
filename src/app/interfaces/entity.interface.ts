export interface IEntity {
  readonly tableName: string;

  readonly id?: string;

  readonly dateCreated?: string;

  readonly dateUpdated?: string;
}
