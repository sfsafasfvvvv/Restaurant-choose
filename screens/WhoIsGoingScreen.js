import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, ActivityIndicator, Alert } from 'react-native'; // Import ActivityIndicator, Alert
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const WhoIsGoingScreen = ({ navigation }) => {
  const [allPeople, setAllPeople] = useState([]); // State to hold all loaded people
  const [selectedPeopleIds, setSelectedPeopleIds] = useState([]); // State to hold selected people IDs
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Load people from AsyncStorage when the component mounts
  useEffect(() => {
    // Use focus listener to reload data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
        loadPeople();
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [navigation]);

  const loadPeople = async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem('people');
      if (data) {
        setAllPeople(JSON.parse(data));
      } else {
        setAllPeople([]); // Ensure it's an empty array if no data
      }
    } catch (error) {
      console.error("Failed to load people:", error);
      Alert.alert('Error', 'Failed to load people list.');
      setAllPeople([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPerson = (id) => {
    setSelectedPeopleIds(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(personId => personId !== id); // Deselect
      } else {
        return [...prevSelected, id]; // Select
      }
    });
  };

  const handleNext = () => {
    if (selectedPeopleIds.length === 0) {
        Alert.alert('Error',"Please select at least one person.");
        return;
    }
    // Find the full objects of the selected people
    const selectedPeopleObjects = allPeople.filter(person => selectedPeopleIds.includes(person.id));
    console.log("Navigating with selected people objects:", selectedPeopleObjects);
    // Pass the array of selected person objects
    navigation.navigate('RestaurantChoice', { participants: selectedPeopleObjects });
  };

  const renderPersonItem = ({ item }) => {
    const isSelected = selectedPeopleIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected ? styles.itemSelected : {}]}
        onPress={() => handleSelectPerson(item.id)}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading people...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who is going?</Text>
      {allPeople.length === 0 ? (
          <Text style={styles.emptyText}>No people added yet. Go to the 'People' tab to add some!</Text>
      ) : (
          <FlatList
            data={allPeople}
            renderItem={renderPersonItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
      )}
      <View style={styles.buttonContainer}>
        <Button
            title="Next"
            onPress={handleNext}
            disabled={selectedPeopleIds.length === 0 || allPeople.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f9f9f9',
    marginBottom: 5,
    borderRadius: 5,
  },
  itemSelected: {
    backgroundColor: '#d0e8ff',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  itemText: {
    fontSize: 18,
  },
   emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    paddingVertical: 15,
  }
});

export default WhoIsGoingScreen;