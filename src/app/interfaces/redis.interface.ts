export interface ConnectionOptions {
  port: number;
  username: string;
  password: string;
  host: string;
  tls: {
    rejectUnauthorized?: boolean;
  };
}
