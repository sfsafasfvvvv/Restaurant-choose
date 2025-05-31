import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import CustomTextInput from '../components/CustomTextInput'; // Assuming CustomTextInput exists for filter inputs

// Re-use price ranges and ratings from RestaurantsScreen (or define centrally)
const PRICE_RANGES = ['Any', '$', '$$', '$$$', '$$$$', '$$$$$'];
const RATINGS = ['Any', '1', '2', '3', '4', '5']; // Add 'Any' option

const RestaurantChoiceScreen = ({ route, navigation }) => {
  const { participants } = route.params; // Get selected participant objects
  const [allRestaurants, setAllRestaurants] = useState([]); // State for ALL loaded restaurants
  const [filteredRestaurants, setFilteredRestaurants] = useState([]); // State for filtered list to display
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isVoteModalVisible, setIsVoteModalVisible] = useState(false);
  const [rejectedRestaurantIds, setRejectedRestaurantIds] = useState([]); // Track rejected restaurants in this session
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0); // Track current voter index
  const [acceptedVoters, setAcceptedVoters] = useState([]); // Track voters who accepted

  // --- Filter State ---
  const [filterStyle, setFilterStyle] = useState('');
  const [filterPrice, setFilterPrice] = useState('Any');
  const [filterDelivery, setFilterDelivery] = useState(null); // null = Any, true = Yes, false = No
  const [filterArea, setFilterArea] = useState('');
  const [filterRating, setFilterRating] = useState('Any'); // Minimum rating

  // Load restaurants from AsyncStorage when the component mounts or focuses
   useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        loadRestaurants();
        // Reset all voting state when screen refocuses
        setRejectedRestaurantIds([]);
        setCurrentVoterIndex(0);
        setAcceptedVoters([]);
    });
    return unsubscribe;
  }, [navigation]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem('restaurants');
      const loadedRestaurants = data ? JSON.parse(data) : [];
      setAllRestaurants(loadedRestaurants);
      setFilteredRestaurants(loadedRestaurants); // Initially show all
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      Alert.alert('Error', 'Failed to load restaurants list.');
      setAllRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtering Logic ---
  const handleApplyFilters = () => {
    let results = [...allRestaurants]; // Start with all restaurants
    let filtersApplied = false;

    // Apply Style filter (case-insensitive partial match)
    if (filterStyle.trim()) {
      results = results.filter(r => r.style.toLowerCase().includes(filterStyle.trim().toLowerCase()));
      filtersApplied = true;
    }
    // Apply Price filter
    if (filterPrice !== 'Any') {
      results = results.filter(r => r.price === filterPrice);
      filtersApplied = true;
    }
    // Apply Delivery filter
    if (filterDelivery !== null) {
      results = results.filter(r => r.delivery === filterDelivery);
      filtersApplied = true;
    }
    // Apply Area filter (case-insensitive partial match)
    if (filterArea.trim()) {
      results = results.filter(r => r.area.toLowerCase().includes(filterArea.trim().toLowerCase()));
      filtersApplied = true;
    }
    // Apply Rating filter (minimum rating)
    if (filterRating !== 'Any') {
      const minRating = parseInt(filterRating, 10);
      results = results.filter(r => parseInt(r.rating, 10) >= minRating);
      filtersApplied = true;
    }

    setFilteredRestaurants(results);
    setRejectedRestaurantIds([]); // Reset rejections when filters change
    setIsFilterModalVisible(false); // Close modal after applying

    // Show feedback about filter results
    if (filtersApplied) {
      if (results.length === 0) {
        Alert.alert('No Results', 'No restaurants match your filters. Try adjusting your criteria.');
      } else {
        Alert.alert('Filters Applied', `Found ${results.length} restaurant${results.length !== 1 ? 's' : ''} matching your criteria.`);
      }
    }
  };

  const handleResetFilters = () => {
      setFilterStyle('');
      setFilterPrice('Any');
      setFilterDelivery(null);
      setFilterArea('');
      setFilterRating('Any');
      setFilteredRestaurants([...allRestaurants]); // Reset list to show all
      setRejectedRestaurantIds([]); // Reset rejections
      setIsFilterModalVisible(false);
  }

  // --- Restaurant Selection Logic ---
  const handleChooseRestaurant = () => {
     // Filter out already rejected restaurants from the currently filtered list
     const availableRestaurants = filteredRestaurants.filter(r => !rejectedRestaurantIds.includes(r.id));

     if (availableRestaurants.length === 0) {
        Alert.alert("No More Options", "No available restaurants match the criteria or all have been rejected in this round.");
        return;
     }
     // Random selection from available options
     const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
     const chosen = availableRestaurants[randomIndex];
     console.log("Chosen restaurant:", chosen);

     // Reset voting state
     setCurrentVoterIndex(0);
     setAcceptedVoters([]);
     setSelectedRestaurant(chosen);

     // Show the voting modal
     setIsVoteModalVisible(true);
  };

  // --- Voting Logic ---
  const handleVote = (accept) => {
      const currentVoter = participants[currentVoterIndex];
      console.log(`Vote from ${currentVoter.name}: ${accept ? 'Accept' : 'Reject'}`);

      if (accept) {
          // Current voter accepts the restaurant
          const newAcceptedVoters = [...acceptedVoters, currentVoter.id];
          setAcceptedVoters(newAcceptedVoters);

          // Check if this was the last voter
          if (currentVoterIndex === participants.length - 1) {
              // All participants have accepted - go to the result screen
              setIsVoteModalVisible(false);
              navigation.navigate('EnjoyMeal', { restaurant: selectedRestaurant, participants });
          } else {
              // Move to the next voter
              setCurrentVoterIndex(currentVoterIndex + 1);
          }
      } else {
          // Current voter rejects the restaurant
          // Add rejected restaurant to the list for this session
          setRejectedRestaurantIds(prev => [...prev, selectedRestaurant.id]);
          setIsVoteModalVisible(false);

          // Show rejection message
          Alert.alert(
              "Restaurant Rejected",
              `${currentVoter.name} has rejected ${selectedRestaurant.name}. This restaurant won't appear again in this session.\n\nPress 'Choose For Me!' to get another suggestion.`
          );
      }
  };

  // --- Rendering ---
  const renderRestaurantItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name} ({item.style})</Text>
      <Text style={styles.itemDetails}>Area: {item.area} | Price: {item.price} | Rating: {item.rating}/5 | Delivery: {item.delivery ? 'Yes' : 'No'}</Text>
    </View>
  );

   if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Choice</Text>
      <Text style={styles.subtitle}>Participants: {participants.map(p => p.name).join(', ')}</Text>

       {allRestaurants.length === 0 ? (
           <Text style={styles.emptyText}>No restaurants added yet. Go to the 'Restaurants' tab to add some!</Text>
       ) : (
           <>
               {/* Filter status indicator */}
               {(filterStyle.trim() || filterPrice !== 'Any' || filterDelivery !== null ||
                 filterArea.trim() || filterRating !== 'Any') && (
                   <View style={styles.filterStatusContainer}>
                       <Text style={styles.filterStatusText}>
                           Showing {filteredRestaurants.length} of {allRestaurants.length} restaurants
                       </Text>
                       <TouchableOpacity
                           onPress={handleResetFilters}
                           style={styles.clearFiltersButton}
                       >
                           <Text style={styles.clearFiltersText}>Clear Filters</Text>
                       </TouchableOpacity>
                   </View>
               )}

               <FlatList
                    data={filteredRestaurants}
                    renderItem={renderRestaurantItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No restaurants match the current filters.</Text>}
                />
           </>
       )}


      <View style={styles.buttonContainer}>
        <Button title="Filter Restaurants" onPress={() => setIsFilterModalVisible(true)} disabled={allRestaurants.length === 0}/>
        <View style={{ height: 10 }} />
        <Button
            title="Choose For Me!"
            onPress={handleChooseRestaurant}
            disabled={filteredRestaurants.length === 0}
        />
      </View>

      {/* --- Filter Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
             <ScrollView style={{width: '100%'}} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.modalTitle}>Filter Options</Text>

                <CustomTextInput
                    label="Style/Cuisine contains"
                    value={filterStyle}
                    onChangeText={setFilterStyle}
                    placeholder="e.g., Italian, Sushi"
                />
                 <CustomTextInput
                    label="Area contains"
                    value={filterArea}
                    onChangeText={setFilterArea}
                    placeholder="e.g., Downtown, Midtown"
                />

                <Text style={styles.label}>Price Range</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={filterPrice} onValueChange={setFilterPrice} style={styles.picker}>
                        {PRICE_RANGES.map(p => <Picker.Item key={p} label={p} value={p} />)}
                    </Picker>
                </View>

                <Text style={styles.label}>Minimum Rating</Text>
                 <View style={styles.pickerContainer}>
                    <Picker selectedValue={filterRating} onValueChange={setFilterRating} style={styles.picker}>
                        {RATINGS.map(r => <Picker.Item key={r} label={r === 'Any' ? 'Any' : `${r} / 5 Stars`} value={r} />)}
                    </Picker>
                 </View>


                <Text style={styles.label}>Delivery</Text>
                <View style={styles.deliveryFilterContainer}>
                    <TouchableOpacity onPress={() => setFilterDelivery(null)} style={[styles.deliveryButton, filterDelivery === null && styles.deliveryButtonSelected]}>
                        <Text style={[styles.deliveryButtonText, filterDelivery === null && styles.deliveryButtonTextSelected]}>Any</Text>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => setFilterDelivery(true)} style={[styles.deliveryButton, filterDelivery === true && styles.deliveryButtonSelected]}>
                        <Text style={[styles.deliveryButtonText, filterDelivery === true && styles.deliveryButtonTextSelected]}>Yes</Text>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => setFilterDelivery(false)} style={[styles.deliveryButton, filterDelivery === false && styles.deliveryButtonSelected]}>
                        <Text style={[styles.deliveryButtonText, filterDelivery === false && styles.deliveryButtonTextSelected]}>No</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.modalButtonContainer}>
                   <Button title="Reset Filters" onPress={handleResetFilters} color="gray" />
                   <Button title="Apply Filters" onPress={handleApplyFilters} />
                </View>
                 <Button title="Cancel" onPress={() => setIsFilterModalVisible(false)} color="red" />
             </ScrollView>
          </View>
        </View>
      </Modal>

       {/* --- Voting Card Modal (Placeholder UI) --- */}
       <Modal
        animationType="fade"
        transparent={true}
        visible={isVoteModalVisible}
        onRequestClose={() => {
          // Prevent accidental closing - require explicit vote
          Alert.alert(
            "Voting in Progress",
            "Please vote Accept or Reject to continue.",
            [{ text: "OK", style: "default" }]
          );
        }}
      >
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, styles.cardModalView]}>
             {selectedRestaurant && (
                 <>
                    <Text style={styles.modalTitle}>Restaurant Selected!</Text>
                    <Text style={styles.cardText}>Name: {selectedRestaurant.name}</Text>
                    <Text style={styles.cardText}>Style: {selectedRestaurant.style}</Text>
                    <Text style={styles.cardText}>Area: {selectedRestaurant.area}</Text>
                    <Text style={styles.cardText}>Price: {selectedRestaurant.price}</Text>
                    <Text style={styles.cardText}>Rating: {selectedRestaurant.rating}/5</Text>
                    <Text style={styles.cardText}>Delivery: {selectedRestaurant.delivery ? 'Yes' : 'No'}</Text>

                    <Text style={styles.votePrompt}>
                        {participants[currentVoterIndex].name}'s Turn to Vote
                        ({currentVoterIndex + 1}/{participants.length})
                    </Text>

                    {acceptedVoters.length > 0 && (
                        <Text style={styles.acceptedVotersText}>
                            Already accepted: {acceptedVoters.map(id => {
                                const voter = participants.find(p => p.id === id);
                                return voter ? voter.name : '';
                            }).join(', ')}
                        </Text>
                    )}

                    <View style={styles.modalButtonContainer}>
                       <Button title="Reject" onPress={() => handleVote(false)} color="red" />
                       <Button title="Accept" onPress={() => handleVote(true)} />
                    </View>
                 </>
             )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

// --- Styles --- (Combine previous styles and add new ones)
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
    marginBottom: 5,
    textAlign: 'center',
  },
   subtitle: {
    fontSize: 14, // Smaller subtitle
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10, // Add padding if names get long
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 12, // Slightly less padding
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fdfdff', // Slightly off-white
    marginBottom: 5,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 17, // Slightly larger name
    fontWeight: '500', // Medium weight
  },
  itemDetails: {
      fontSize: 13,
      color: '#555',
      marginTop: 2,
  },
  buttonContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
  },
  // --- Modal Styles ---
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker dim
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20, // Adjusted padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Wider modal
    maxHeight: '85%', // Limit height
  },
   cardModalView: {
    width: '85%', // Slightly narrower for card
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20, // More space below title
    textAlign: 'center',
  },
  modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 25, // More space above buttons
      marginBottom: 10,
      width: '100%',
  },
  label: { // Style for filter labels
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
   pickerContainer: { // Style for picker wrapper
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 10,
      backgroundColor: '#fff',
  },
  picker: { // Style for the picker itself
      height: 50,
      width: '100%',
  },
  deliveryFilterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 15,
      marginTop: 5,
  },
  deliveryButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      backgroundColor: '#f8f9fa', // Default background
  },
  deliveryButtonSelected: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
  },
  deliveryButtonText: {
      color: '#333',
       fontSize: 14,
  },
  deliveryButtonTextSelected: { // Style for text when button is selected
      color: '#fff',
  },
  // --- Card Modal Specific ---
  cardText: {
      fontSize: 16,
      marginBottom: 6,
      textAlign: 'center',
  },
  votePrompt: {
      marginTop: 20,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#dc3545', // Red prompt
  },
  acceptedVotersText: {
      marginTop: 10,
      marginBottom: 15,
      fontSize: 14,
      textAlign: 'center',
      color: '#28a745', // Green text for accepted voters
      fontStyle: 'italic',
  },
  // --- Filter Status Styles ---
  filterStatusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: '#e6f7ff', // Light blue background
      borderRadius: 5,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#91d5ff',
  },
  filterStatusText: {
      fontSize: 14,
      color: '#0050b3',
  },
  clearFiltersButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: '#1890ff',
      borderRadius: 4,
  },
  clearFiltersText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
  }
});

export default RestaurantChoiceScreen;