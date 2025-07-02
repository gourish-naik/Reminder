import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient'; // Fixed import
import Icon from 'react-native-vector-icons/Feather'; // Fixed icon import
import { AlarmManager } from '../services/AlarmManager';
import { Alarm } from '../types/Alarm';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextAlarm, setNextAlarm] = useState<Alarm | null>(null);
  const [alarmManager] = useState(() => new AlarmManager());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadNextAlarm = () => {
      const alarm = alarmManager.getNextAlarm();
      setNextAlarm(alarm);
    };

    loadNextAlarm();
    const interval = setInterval(loadNextAlarm, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [alarmManager]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNextAlarm = (alarm: Alarm) => {
    if (!alarm.nextTrigger) return null;
    
    const now = new Date();
    const next = new Date(alarm.nextTrigger);
    const diff = next.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const greetings = {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night',
    };
    return greetings[timeOfDay];
  };

  const getTimeIcon = () => {
    const timeOfDay = getTimeOfDay();
    return timeOfDay === 'night' || timeOfDay === 'evening' ? 
      <Icon name="moon" size={24} color="#FF6B6B" /> : 
      <Icon name="sun" size={24} color="#FF6B6B" />;
  };

  const nextAlarmTime = nextAlarm ? formatNextAlarm(nextAlarm) : null;

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
      style={styles.container}
    >
      <Animated.View entering={FadeIn.delay(200)} style={styles.greetingContainer}>
        <View style={styles.greetingRow}>
          {getTimeIcon()}
          <Text style={styles.greetingText}>{getGreeting()}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.clockContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.secondsText}>:{currentTime.getSeconds().toString().padStart(2, '0')}</Text>
      </Animated.View>
      
      <Animated.View entering={FadeIn.delay(600)} style={styles.dateContainer}>
        <Icon name="calendar" size={20} color="#CCCCCC" />
        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(800)} style={styles.infoContainer}>
        {nextAlarm ? (
          <View style={styles.alarmCard}>
            <View style={styles.alarmHeader}>
              <Icon name="bell" size={20} color="#FF6B6B" />
              <Text style={styles.alarmTitle}>Next Alarm</Text>
            </View>
            <Text style={styles.alarmTime}>
              {nextAlarm.time.split(':').map(Number).map((n, i) => {
                const hour = i === 0 ? (n % 12 || 12) : n;
                return i === 0 ? hour : n.toString().padStart(2, '0');
              }).join(':')} {parseInt(nextAlarm.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
            </Text>
            <Text style={styles.alarmLabel}>{nextAlarm.title}</Text>
            {nextAlarmTime && (
              <Text style={styles.alarmCountdown}>in {nextAlarmTime}</Text>
            )}
          </View>
        ) : (
          <View style={styles.noAlarmCard}>
            <Icon name="clock" size={20} color="#666666" />
            <Text style={styles.noAlarmText}>No upcoming alarms</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(1000)} style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Active Alarms</Text>
            <Text style={styles.statusValue}>
              {alarmManager.getAllAlarms().filter(a => a.isActive).length}
            </Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Total Alarms</Text>
            <Text style={styles.statusValue}>
              {alarmManager.getAllAlarms().length}
            </Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  timeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 72,
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  secondsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 32,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  alarmCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  alarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  alarmTime: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  alarmLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  alarmCountdown: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF6B6B',
  },
  noAlarmCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  noAlarmText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  statusContainer: {
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  statusDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
});