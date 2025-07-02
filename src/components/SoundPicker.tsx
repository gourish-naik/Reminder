import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


interface SoundPickerProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

const soundOptions = [
  { value: 'default', label: 'Default', file: '/assets/sounds/alarm1.wav' },
  { value: 'none', label: 'None', file: null },
];

export default function SoundPicker({ selectedSound, onSoundChange }: SoundPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const selectedOption = soundOptions.find(option => option.value === selectedSound);

  const playPreview = (soundFile: string | null, soundValue: string) => {
    if (!soundFile || Platform.OS !== 'web') return;

    if (playingSound === soundValue) {
      setPlayingSound(null);
      return;
    }

    setPlayingSound(soundValue);
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      setPlayingSound(null);
    }, 2000);
  };

  const selectSound = (sound: string) => {
    onSoundChange(sound);
    setExpanded(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectedOption}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.selectedText}>{selectedOption?.label}</Text>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>{expanded ? '▼' : '▶'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.dropdown}
        >
          {soundOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selectedSound === option.value && styles.optionSelected,
              ]}
              onPress={() => selectSound(option.value)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    selectedSound === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                
                {option.file && (
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={() => playPreview(option.file, option.value)}
                  >
                    {playingSound === option.value ? (
                      <Icon name="VolumeX" size={16} color="#FF6B6B" strokeWidth={2} />
                    ) : (
                      <Icon name="Volume2" size={16} color="#CCCCCC" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 120,
  },
  selectedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#CCCCCC',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  optionTextSelected: {
    color: '#FF6B6B',
  },
  previewButton: {
    padding: 4,
  },
});