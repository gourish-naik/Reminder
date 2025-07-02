
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    time: string;
    status: string;
  };
}

const statusColors: { [key: string]: string } = {
  pending: '#f44336',
  upcoming: '#ff9800',
  completed: '#4caf50',
};

function TaskCard({ task }: TaskCardProps): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <Card.Title title={task.title} subtitle={`Due at ${task.time}`} />
      <Card.Content>
        <Chip icon="information"
          style={[styles.chip, { backgroundColor: statusColors[task.status] || '#9e9e9e' }]}
          textStyle={styles.chipText}
        >
          {task.status.toUpperCase()}
        </Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#ffffff',
  },
});

export default TaskCard;
