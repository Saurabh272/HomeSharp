export interface CreateConnectRequestInterface {
  type: string;
  payload: {
    name?: string;
    phoneNumber?: string;
    email?: string;
    location?: string;
  };
  leadId?: string;
}
