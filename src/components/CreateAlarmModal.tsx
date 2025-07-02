import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { X, Clock, Calendar, Volume2, Smartphone } from 'lucide-react-native';
import { Alarm } from '@/types/Alarm';

interface CreateAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: Omit<Alarm, 'id'>) => void;
  editingAlarm?: Alarm | null;
}

export default function CreateAlarmModal({ visible, onClose, onSave, editingAlarm }: CreateAlarmModalProps) {
  const [title, setTitle] = useState(editingAlarm?.title || 'New Alarm');
  const [time, setTime] = useState(editingAlarm?.time || '07:00');
  const [repeatType, setRepeatType] = useState<Alarm['repeatType']>(editingAlarm?.repeatType || 'once');
  const [sound, setSound] = useState(editingAlarm?.sound || 'default');
  const [vibrate, setVibrate] = useState(editingAlarm?.vibrate ?? true);
  const [customDays, setCustomDays] = useState<number[]>(editingAlarm?.repeatDays || []);

  const repeatOptions = [
    { value: 'once', label: 'Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'custom', label: 'Custom' },
  ];

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'gentle', label: 'Gentle Bell' },
    { value: 'classic', label: 'Classic Alarm' },
    { value: 'nature', label: 'Nature Sounds' },
    { value: 'none', label: 'None' },
  ];

  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const handleSave = () => {
    const alarmData: Omit<Alarm, 'id'> = {
      title,
      time,
      isActive: true,
      repeatType,
      repeatDays: repeatType === 'custom' ? customDays : undefined,
      sound,
      vibrate,
      createdAt: editingAlarm?.createdAt || new Date(),
    };

    onSave(alarmData);
    onClose();
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const adjustTime = (field: 'hours' | 'minutes', increment: number) => {
    const { hours, minutes } = parseTime(time);
    
    if (field === 'hours') {
      const newHours = (hours + increment + 24) % 24;
      setTime(formatTime(newHours, minutes));
    } else {
      const newMinutes = (minutes + increment + 60) % 60;
      setTime(formatTime(hours, newMinutes));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {editingAlarm ? 'Edit Alarm' : 'New Alarm'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#CCCCCC" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Time Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.timePicker}>
              <View style={styles.timeColumn}>
                <TouchableOpacity 
                  style={styles.timeButton} 
                  onPress={() => adjustTime('hours', 1)}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>{parseTime(time).hours.toString().padStart(2, '0')}</Text>
                <TouchableOpacity 
                  style={styles.timeButton} 
                  onPress={() => adjustTime('hours', -1)}
                >
                  <Text style={styles.timeButtonText}>-</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timeColumn}>
                <TouchableOpacity 
                  style={styles.timeButton} 
                  onPress={() => adjustTime('minutes', 1)}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>{parseTime(time).minutes.toString().padStart(2, '0')}</Text>
                <TouchableOpacity 
                  style={styles.timeButton} 
                  onPress={() => adjustTime('minutes', -1)}
                >
                  <Text style={styles.timeButtonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Alarm title"
              placeholderTextColor="#666666"
            />
          </View>

          {/* Repeat Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat</Text>
            <View style={styles.optionsGrid}>
              {repeatOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    repeatType === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setRepeatType(option.value as Alarm['repeatType'])}
                >
                  <Text style={[
                    styles.optionText,
                    repeatType === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Days */}
          {repeatType === 'custom' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Days</Text>
              <View style={styles.daysGrid}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      customDays.includes(day.value) && styles.dayButtonActive
                    ]}
                    onPress={() => toggleCustomDay(day.value)}
                  >
                    <Text style={[
                      styles.dayText,
                      customDays.includes(day.value) && styles.dayTextActive
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sound Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound</Text>
            <View style={styles.optionsGrid}>
              {soundOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    sound === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setSound(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    sound === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vibration Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Smartphone size={20} color="#CCCCCC" strokeWidth={2} />
                <Text style={styles.toggleLabel}>Vibration</Text>
              </View>
              <Switch
                value={vibrate}
                onValueChange={setVibrate}
                trackColor={{ false: '#333333', true: '#FF6B6B' }}
                thumbColor={vibrate ? '#FFFFFF' : '#CCCCCC'}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  timeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  timeValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#FF6B6B',
    marginVertical: 8,
  },
  timeSeparator: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#FF6B6B',
    marginHorizontal: 16,
  },
  titleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#CCCCCC',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  dayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#CCCCCC',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#CCCCCC',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});