export interface FacebookPixelData {
  data: {
    event_name: string;
    event_time: number;
    user_data: {
      em: string[];
      ph: string[];
      client_ip_address: string;
      client_user_agent: string;
      external_id: string;
    };
    custom_data: Record<string, any>;
    event_source_url: string;
    action_source: string;
  }[];
  test_event_code?: string;
}
