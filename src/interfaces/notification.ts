export interface Notification {
  type: string;
  recipient: string;
  content: string;
  timestamp?: Date;
}