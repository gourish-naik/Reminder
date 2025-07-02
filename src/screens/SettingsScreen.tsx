import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Feather';
import Animated from 'react-native-reanimated';
import { FadeInDown } from 'react-native-reanimated';
import { AlarmManager } from '../services/AlarmManager';
import CustomSlider from '../components/CustomSlider';
import SoundPicker from '../components/SoundPicker';

export default function SettingsScreen() {
  const [alarmManager] = useState(() => new AlarmManager());
  const [settings, setSettings] = useState({
    defaultSound: 'default',
    defaultVibrate: true,
    snoozeMinutes: 9,
    volumeLevel: 0.8,
    use24HourFormat: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = alarmManager.getSettings();
    setSettings(currentSettings);
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await alarmManager.updateSettings({ [key]: value });
  };

  const handleVolumeChange = (value: number) => {
    updateSetting('volumeLevel', value);
    // Play preview sound at new volume level
    if (Platform.OS === 'web') {
      const audio = new Audio('/assets/sounds/alarm1.wav');
      audio.volume = value;
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 1000);
    }
  };

  const handleExportSettings = async () => {
    try {
      const allAlarms = alarmManager.getAllAlarms();
      const exportData = {
        alarms: allAlarms,
        settings: settings,
        exportDate: new Date().toISOString(),
      };
      
      if (Platform.OS === 'web') {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `alarm-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const settingSections = [
    {
      title: 'Default Alarm Settings',
      icon: <Icon name="Bell" size={20} color="#FF6B6B" strokeWidth={2} />,
      items: [
        {
          label: 'Default Sound',
          component: (
            <SoundPicker
              selectedSound={settings.defaultSound}
              onSoundChange={(sound) => updateSetting('defaultSound', sound)}
            />
          ),
        },
        {
          label: 'Default Vibration',
          component: (
            <Switch
              value={settings.defaultVibrate}
              onValueChange={(value) => updateSetting('defaultVibrate', value)}
              trackColor={{ false: '#333333', true: '#FF6B6B' }}
              thumbColor={settings.defaultVibrate ? '#FFFFFF' : '#CCCCCC'}
            />
          ),
        },
      ],
    },
    {
      title: 'Audio Settings',
      icon: <Icon name="Volume2" size={20} color="#FF6B6B" strokeWidth={2} />,
      items: [
        {
          label: 'Volume Level',
          value: `${Math.round(settings.volumeLevel * 100)}%`,
          component: (
            <View style={styles.sliderContainer}>
              <CustomSlider
                value={settings.volumeLevel}
                onValueChange={handleVolumeChange}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
              />
            </View>
          ),
        },
        {
          label: 'Snooze Duration',
          value: `${settings.snoozeMinutes} minutes`,
          component: (
            <View style={styles.snoozeContainer}>
              {[5, 9, 10, 15, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.snoozeOption,
                    settings.snoozeMinutes === minutes && styles.snoozeOptionActive,
                  ]}
                  onPress={() => updateSetting('snoozeMinutes', minutes)}
                >
                  <Text
                    style={[
                      styles.snoozeOptionText,
                      settings.snoozeMinutes === minutes && styles.snoozeOptionTextActive,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ),
        },
      ],
    },
    {
      title: 'Display Settings',
      icon: <Icon name="Clock" size={20} color="#FF6B6B" strokeWidth={2} />,
      items: [
        {
          label: '24-Hour Format',
          component: (
            <Switch
              value={settings.use24HourFormat}
              onValueChange={(value) => updateSetting('use24HourFormat', value)}
              trackColor={{ false: '#333333', true: '#FF6B6B' }}
              thumbColor={settings.use24HourFormat ? '#FFFFFF' : '#CCCCCC'}
            />
          ),
        },
      ],
    },
    {
      title: 'Data Management',
      icon: <Icon name="Download" size={20} color="#FF6B6B" strokeWidth={2} />,
      items: [
        {
          label: 'Export Settings',
          component: (
            <TouchableOpacity style={styles.actionButton} onPress={handleExportSettings}>
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
          ),
        },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Icon name="Settings" size={28} color="#FF6B6B" strokeWidth={2} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(sectionIndex * 100)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={item.label} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.value && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                  </View>
                  <View style={styles.settingControl}>
                    {item.component}
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.appInfoSection}
        >
          <View style={styles.sectionHeader}>
            <Icon name="Info" size={20} color="#FF6B6B" strokeWidth={2} />
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>
          
          <View style={styles.appInfoContent}>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Build</Text>
              <Text style={styles.appInfoValue}>2024.1</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Platform</Text>
              <Text style={styles.appInfoValue}>{Platform.OS}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.footerSpace} />
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 64,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#CCCCCC',
  },
  settingControl: {
    marginLeft: 16,
  },
  sliderContainer: {
    width: 120,
  },
  snoozeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  snoozeOptionActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  snoozeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#CCCCCC',
  },
  snoozeOptionTextActive: {
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  appInfoSection: {
    marginBottom: 32,
  },
  appInfoContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  appInfoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  appInfoValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#CCCCCC',
  },
  footerSpace: {
    height: 100,
  },
});