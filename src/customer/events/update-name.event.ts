export class UpdateNameEvent {
  name: string;

  constructor(params: { name: string }) {
    this.name = params?.name;
  }
}
