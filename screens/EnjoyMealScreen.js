import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const EnjoyMealScreen = ({ route, navigation }) => {
  // Get data passed from the previous screen
  const { restaurant, participants } = route.params;

  const handleRestart = () => {
    // Navigate back to the beginning of the decision flow
    // Using popToTop() goes back to the first screen in the stack navigator
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enjoy your meal!</Text>
      {restaurant && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Chosen Restaurant:</Text>
          <Text style={styles.detailsText}>{restaurant.name}</Text>
          <Text style={styles.detailsText}>Style: {restaurant.style}</Text>
          <Text style={styles.detailsText}>Area: {restaurant.area}</Text>
          <Text style={styles.detailsText}>Price: {restaurant.price} | Rating: {restaurant.rating}/5</Text>
          <Text style={styles.detailsText}>Delivery: {restaurant.delivery ? 'Yes' : 'No'}</Text>
        </View>
      )}
      {participants && participants.length > 0 && (
         <View style={styles.detailsContainer}>
           <Text style={styles.detailsTitle}>Participants ({participants.length}):</Text>
           <Text style={styles.detailsText}>
             {participants.map(person => person.name).join(', ')}
           </Text>
         </View>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Start New Decision" onPress={handleRestart} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8fadf', // Light green background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32', // Dark green color
    marginBottom: 30,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  detailsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
  },
  detailsText: {
      fontSize: 16,
      color: '#555',
  },
  buttonContainer: {
    marginTop: 20,
  }
});

export default EnjoyMealScreen;