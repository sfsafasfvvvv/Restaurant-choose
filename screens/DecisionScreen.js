import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';

const DecisionScreen = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [people, setPeople] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const peopleData = await AsyncStorage.getItem('people');
      const restaurantsData = await AsyncStorage.getItem('restaurants');

      if (peopleData) setPeople(JSON.parse(peopleData));
      if (restaurantsData) setRestaurants(JSON.parse(restaurantsData));
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const makeDecision = () => {
    if (people.length === 0 || restaurants.length === 0) {
      Alert.alert('Missing Data', 'Please add people and restaurants first.');
      return;
    }

    const randomPerson = people[Math.floor(Math.random() * people.length)];
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    setSelectedPerson(randomPerson);
    setSelectedRestaurant(randomRestaurant);
  };

  return (
    <View style={styles.container}>
      <CustomButton
        text="Random Choose"
        onPress={makeDecision}
        buttonStyle={styles.decisionButton}
      />

      {selectedPerson && selectedRestaurant && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Today <Text style={styles.highlight}>{selectedPerson.name}</Text>
            {'\n'}will go to <Text style={styles.highlight}>{selectedRestaurant.name}</Text>
            {selectedRestaurant.style ? `\n(${selectedRestaurant.style})` : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionButton: {
    backgroundColor: '#f70000',
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  highlight: {
    color: '#f70000',
    fontWeight: 'bold',
  },
});

export default DecisionScreen;
