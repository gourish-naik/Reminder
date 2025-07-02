
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

function FilterCapsules(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = React.useState('All');

  const filters = ['All', 'Completed', 'Pending', 'Upcoming'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {filters.map(filter => (
        <Chip
          key={filter}
          mode={activeFilter === filter ? 'flat' : 'outlined'}
          onPress={() => setActiveFilter(filter)}
          style={styles.chip}
        >
          {filter}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
  },
});

export default FilterCapsules;
