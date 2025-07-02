import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Feather';
import { AlarmManager } from '../services/AlarmManager';
import { Alarm } from '../types/Alarm';
import AlarmCard from '../components/AlarmCard';
import CreateAlarmModal from '../modals/AddEditTaskModal';
import Animated from 'react-native-reanimated';
import { FadeInDown } from 'react-native-reanimated';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [alarmManager] = useState(() => new AlarmManager());

  useEffect(() => {
    loadAlarms();
    // Request notification permission on mount
    alarmManager.requestNotificationPermission();
  }, []);

  const loadAlarms = async () => {
    const loadedAlarms = alarmManager.getAllAlarms();
    setAlarms(loadedAlarms);
  };

  const handleToggleAlarm = async (id: string) => {
    await alarmManager.toggleAlarm(id);
    loadAlarms();
  };

  const handleEditAlarm = (id: string) => {
    const alarm = alarmManager.getAlarm(id);
    if (alarm) {
      setEditingAlarm(alarm);
      setShowCreateModal(true);
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await alarmManager.deleteAlarm(id);
            loadAlarms();
          },
        },
      ]
    );
  };

  const handleSaveAlarm = async (alarmData: Omit<Alarm, 'id'>) => {
    if (editingAlarm) {
      await alarmManager.updateAlarm(editingAlarm.id, alarmData);
      setEditingAlarm(null);
    } else {
      await alarmManager.createAlarm(alarmData);
    }
    loadAlarms();
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAlarm(null);
  };

  const renderAlarmItem = ({ item, index }: { item: Alarm; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <AlarmCard
        alarm={item}
        onToggle={handleToggleAlarm}
        onEdit={handleEditAlarm}
        onDelete={handleDeleteAlarm}
      />
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="Plus" size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="Clock" size={64} color="#666666" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No Alarms Set</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to create your first alarm
          </Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.alarmsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreateAlarmModal
        visible={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveAlarm}
        editingAlarm={editingAlarm}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#CCCCCC',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
  },
  alarmsList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
});