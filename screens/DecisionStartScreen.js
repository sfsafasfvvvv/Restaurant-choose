import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DecisionStartScreen = ({ navigation }) => {
  const handleScreenTap = () => {
    // Navigate to the WhoIsGoing screen when the screen is tapped
    navigation.navigate('WhoIsGoing');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleScreenTap} activeOpacity={1}>
      <Text style={styles.title}>It's decision time!</Text>
      <Text style={styles.subtitle}>(Tap anywhere to start)</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Example background color
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
      fontSize: 16,
      color: '#666',
  }
});

export default DecisionStartScreen;