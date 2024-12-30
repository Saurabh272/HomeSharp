export interface SmsQueueData {
  otp: string;
  phoneNumber: string;
  swnRefNo: string;
  provider?: string;
}

interface SmsStatus {
  description: string;
  groupId: number;
  groupName: string;
  id: number;
  name: string;
}

export interface SmsMessage {
  messageId: string;
  status: SmsStatus;
  to: string;
  message?: string;
}

interface SmsData {
  messages: SmsMessage[];
}

export interface SmsResponse {
  data?: SmsData;
  error?: string;
}

export interface DoveSoftSmsResponse {
  smslist: {
    sms: {
      reason: string;
      code: string;
      clientsmsid: number;
      messageid: number;
      mobileno: string;
      status: string;
    };
  };
  message?: string;
}

export interface FailureLogData {
  eventType: string;
  remarks: string;
  sourceOrigin: string;
  recipient: string;
}
