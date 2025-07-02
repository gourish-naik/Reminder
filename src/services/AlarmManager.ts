import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notifee, { AndroidImportance, TriggerType, RepeatInterval, AuthorizationStatus } from '@notifee/react-native';
import { Alarm, AlarmSettings } from '../types/Alarm';

export class AlarmManager {
  private static instance: AlarmManager;
  private alarms: Alarm[] = [];
  private activeTimers: Map<string, string | NodeJS.Timeout> = new Map();
  private settings: AlarmSettings = {
    defaultSound: 'default',
    defaultVibrate: true,
    snoozeMinutes: 9,
    volumeLevel: 0.8,
    use24HourFormat: false,
  };

  constructor() {
    if (AlarmManager.instance) {
      return AlarmManager.instance;
    }
    AlarmManager.instance = this;
    this.initializeNotifications();
    this.loadAlarms();
    this.loadSettings();
  }

  private async initializeNotifications(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'alarm',
        name: 'Alarm Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'alarm_sound', // Make sure you have alarm_sound.mp3 in android/app/src/main/res/raw
        vibrationPattern: [300, 500, 300, 500],
        lights: true,
        lightColor: '#FF6B6B',
      });
    }
  }

  private async loadAlarms(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('alarms');
      if (stored) {
        this.alarms = JSON.parse(stored).map((alarm: any) => ({
          ...alarm,
          createdAt: new Date(alarm.createdAt),
          nextTrigger: alarm.nextTrigger ? new Date(alarm.nextTrigger) : undefined,
        }));
        this.scheduleActiveAlarms();
      }
    } catch (error) {
      console.error('Failed to load alarms:', error);
    }
  }

  private async saveAlarms(): Promise<void> {
    try {
      await AsyncStorage.setItem('alarms', JSON.stringify(this.alarms));
    } catch (error) {
      console.error('Failed to save alarms:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('alarmSettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('alarmSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private scheduleActiveAlarms(): void {
    this.alarms.filter(alarm => alarm.isActive).forEach(alarm => {
      this.scheduleAlarm(alarm);
    });
  }

  private async scheduleAlarm(alarm: Alarm): Promise<void> {
    this.cancelAlarm(alarm.id);
    
    const nextTrigger = this.calculateNextTrigger(alarm);
    if (!nextTrigger) return;

    const now = new Date();
    const timeUntilTrigger = nextTrigger.getTime() - now.getTime();

    if (timeUntilTrigger > 0) {
      // Since it's native Android, we always use notifee
      try {
        const notificationId = await notifee.createTriggerNotification(
          {
            title: alarm.title,
            body: 'Alarm is ringing!',
            android: {
              channelId: 'alarm',
              importance: AndroidImportance.HIGH,
              sound: alarm.sound !== 'none' ? 'alarm_sound' : undefined,
              pressAction: {
                id: 'default',
              },
              fullScreenAction: {
                id: 'default',
                launchActivity: 'default',
              },
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: nextTrigger.getTime(),
          }
        );
        this.activeTimers.set(alarm.id, notificationId);
      } catch (error) {
        console.error('Failed to schedule notification:', error);
      }
      
      // Update alarm with next trigger time
      const alarmIndex = this.alarms.findIndex(a => a.id === alarm.id);
      if (alarmIndex !== -1) {
        this.alarms[alarmIndex].nextTrigger = nextTrigger;
        this.saveAlarms();
      }
    }
  }

  private calculateNextTrigger(alarm: Alarm): Date | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    let nextTrigger = new Date();
    nextTrigger.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow or next valid day
    if (nextTrigger <= now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }

    switch (alarm.repeatType) {
      case 'once':
        return nextTrigger > now ? nextTrigger : null;
      
      case 'daily':
        return nextTrigger;
      
      case 'weekdays':
        while (nextTrigger.getDay() === 0 || nextTrigger.getDay() === 6) {
          nextTrigger.setDate(nextTrigger.getDate() + 1);
        }
        return nextTrigger;
      
      case 'weekends':
        while (nextTrigger.getDay() !== 0 && nextTrigger.getDay() !== 6) {
          nextTrigger.setDate(nextTrigger.getDate() + 1);
        }
        return nextTrigger;
      
      case 'custom':
        if (!alarm.repeatDays || alarm.repeatDays.length === 0) return null;
        
        while (!alarm.repeatDays.includes(nextTrigger.getDay())) {
          nextTrigger.setDate(nextTrigger.getDate() + 1);
        }
        return nextTrigger;
      
      default:
        return nextTrigger;
    }
  }

  private triggerAlarm(alarm: Alarm): void {
    // Reschedule if recurring
    if (alarm.repeatType !== 'once') {
      this.scheduleAlarm(alarm);
    } else {
      // Turn off one-time alarms
      this.toggleAlarm(alarm.id);
    }
  }

  private async cancelAlarm(alarmId: string): Promise<void> {
    const timerOrNotificationId = this.activeTimers.get(alarmId);
    if (timerOrNotificationId) {
      // Since it's native Android, we always cancel notifications
      try {
        await notifee.cancelNotification(timerOrNotificationId as string);
      } catch (error) {
        console.error('Failed to cancel notification:', error);
      }
      this.activeTimers.delete(alarmId);
    }
  }

  public async createAlarm(alarmData: Omit<Alarm, 'id'>): Promise<Alarm> {
    const alarm: Alarm = {
      ...alarmData,
      id: Date.now().toString(),
    };

    this.alarms.push(alarm);
    await this.saveAlarms();

    if (alarm.isActive) {
      await this.scheduleAlarm(alarm);
    }

    return alarm;
  }

  public async updateAlarm(alarmId: string, updates: Partial<Alarm>): Promise<Alarm | null> {
    const index = this.alarms.findIndex(a => a.id === alarmId);
    if (index === -1) return null;

    const alarm = { ...this.alarms[index], ...updates };
    this.alarms[index] = alarm;
    await this.saveAlarms();

    // Reschedule if active
    if (alarm.isActive) {
      await this.scheduleAlarm(alarm);
    } else {
      await this.cancelAlarm(alarmId);
    }

    return alarm;
  }

  public async deleteAlarm(alarmId: string): Promise<boolean> {
    const index = this.alarms.findIndex(a => a.id === alarmId);
    if (index === -1) return false;

    await this.cancelAlarm(alarmId);
    this.alarms.splice(index, 1);
    await this.saveAlarms();
    return true;
  }

  public async toggleAlarm(alarmId: string): Promise<boolean> {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (!alarm) return false;

    alarm.isActive = !alarm.isActive;
    await this.saveAlarms();

    if (alarm.isActive) {
      await this.scheduleAlarm(alarm);
    } else {
      await this.cancelAlarm(alarm.id);
    }

    return alarm.isActive;
  }

  public getAllAlarms(): Alarm[] {
    return [...this.alarms];
  }

  public getAlarm(alarmId: string): Alarm | null {
    return this.alarms.find(a => a.id === alarmId) || null;
  }

  public getNextAlarm(): Alarm | null {
    const activeAlarms = this.alarms.filter(a => a.isActive && a.nextTrigger);
    if (activeAlarms.length === 0) return null;

    return activeAlarms.reduce((earliest, current) => {
      if (!earliest.nextTrigger || !current.nextTrigger) return earliest;
      return current.nextTrigger < earliest.nextTrigger ? current : earliest;
    });
  }

  public getSettings(): AlarmSettings {
    return { ...this.settings };
  }

  public async updateSettings(updates: Partial<AlarmSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      // On Android, AuthorizationStatus.AUTHORIZED (value 1) indicates permission granted.
      // For Android 12 and below, permissions are often granted by default.
      // For Android 13 (API 33) and above, a runtime permission dialog is shown.
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED; 
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }
}