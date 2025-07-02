export interface Alarm {
  id: string;
  title: string;
  time: string; // HH:MM format
  isActive: boolean;
  repeatType: 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';
  repeatDays?: number[]; // 0-6, Sunday-Saturday
  sound: string;
  vibrate: boolean;
  createdAt: Date;
  nextTrigger?: Date;
}

export interface AlarmSettings {
  defaultSound: string;
  defaultVibrate: boolean;
  snoozeMinutes: number;
  volumeLevel: number;
  use24HourFormat: boolean;
}