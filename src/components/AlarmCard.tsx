import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Alarm } from '../types/Alarm';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AlarmCard({ alarm, onToggle, onEdit, onDelete }: AlarmCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(alarm.isActive ? 1 : 0.6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const formatTime = (time: string, use24Hour: boolean = false) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    
    if (use24Hour) {
      return `${hours}:${minutes}`;
    }
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getRepeatText = (repeatType: string) => {
    const repeatTexts = {
      once: 'Once',
      daily: 'Daily',
      weekdays: 'Weekdays',
      weekends: 'Weekends',
      custom: 'Custom',
    };
    return repeatTexts[repeatType as keyof typeof repeatTexts] || 'Once';
  };

  const getNextAlarmText = () => {
    if (!alarm.nextTrigger || !alarm.isActive) return null;
    
    const now = new Date();
    const next = new Date(alarm.nextTrigger);
    const diff = next.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 24) {
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
  };

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });
    onToggle(alarm.id);
    opacity.value = withSpring(alarm.isActive ? 0.6 : 1);
  };

  const nextAlarmText = getNextAlarmText();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity style={styles.mainContent} onPress={handlePress}>
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(alarm.time)}</Text>
          <Text style={styles.titleText}>{alarm.title}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.repeatText}>{getRepeatText(alarm.repeatType)}</Text>
            {nextAlarmText && (
              <Text style={styles.nextAlarmText}>in {nextAlarmText}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.statusSection}>
          <View style={styles.iconsRow}>
            {alarm.sound !== 'none' && (
              <Icon name="Volume2" size={16} color="#FF6B6B" strokeWidth={2} />
            )}
            {alarm.vibrate && (
              <Icon name="Smartphone" size={16} color="#FF6B6B" strokeWidth={2} style={{ marginLeft: 8 }} />
            )}
          </View>
          
          <View style={[
            styles.toggleSwitch,
            { backgroundColor: alarm.isActive ? '#FF6B6B' : '#333333' }
          ]}>
            <Animated.View style={[
              styles.toggleThumb,
              { transform: [{ translateX: alarm.isActive ? 20 : 2 }] }
            ]} />
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit(alarm.id)}
        >
          <Icon name="Edit3"  size={20} color="#CCCCCC" strokeWidth={2} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDelete(alarm.id)}
        >
          <Icon name="Trash2" size={20} color="#FF4444" strokeWidth={2} />
          <Text style={[styles.actionText, { color: '#FF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  timeSection: {
    flex: 1,
  },
  timeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repeatText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
  },
  nextAlarmText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FF6B6B',
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 16,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 24,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },
});