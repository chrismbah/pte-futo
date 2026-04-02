export interface INotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "announcement" | "update";
  createdAt: string;
  read: boolean;
  link?: string;
  icon?: string;
}

export type TNotificationType = INotification["type"];
