import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Switch, ScrollView, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';

// Define price range options
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$', '$$$$$'];
// Define rating options
const RATINGS = ['1', '2', '3', '4', '5']; // As strings

const RestaurantsScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  // Form state for adding/editing
  const [name, setName] = useState('');
  const [style, setStyle] = useState(''); // Renamed from cuisine
  const [price, setPrice] = useState(PRICE_RANGES[1]); // Default to '$$'
  const [delivery, setDelivery] = useState(false);
  const [area, setArea] = useState('');
  const [rating, setRating] = useState(RATINGS[2]); // Default to '3'

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await AsyncStorage.getItem('restaurants');
      if (data) {
        let loadedRestaurants = JSON.parse(data);
        // Ensure each restaurant has a unique ID, especially for old data without IDs
        loadedRestaurants = loadedRestaurants.map((restaurant, index) => {
            if (!restaurant.id) {
                // Generate a more unique ID by combining timestamp and index/randomness
                return { ...restaurant, id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}` };
            }
            return restaurant;
        });
        setRestaurants(loadedRestaurants);
      }
    } catch (error) {
      console.error("Failed to load restaurants:", error);
      Alert.alert('Error', 'Failed to load restaurants.');
    }
  };

  const saveRestaurant = async () => {
    const trimmedName = name.trim();
    const trimmedStyle = style.trim();
    const trimmedArea = area.trim();

    console.log('Validating restaurant...');

    if (!trimmedName) {
      console.log('Validation failed: Name is empty');
      if (Platform.OS === 'web') {
        window.alert('Error: Restaurant name cannot be empty');
      } else {
        Alert.alert('Error', 'Restaurant name cannot be empty');
      }
      return;
    }
    console.log('Validation passed: Name is not empty');

    if (!trimmedStyle) {
        console.log('Validation failed: Style is empty');
        if (Platform.OS === 'web') {
          window.alert('Error: Style/Cuisine cannot be empty');
        } else {
          Alert.alert('Error', 'Style/Cuisine cannot be empty');
        }
        return;
    }
    console.log('Validation passed: Style is not empty');

    // 验证风格/菜系：不能包含数字
    if (/[0-9]/.test(trimmedStyle)) {
        console.log('Validation failed: Style contains numbers');
        if (Platform.OS === 'web') {
          window.alert('Error: Style/Cuisine cannot contain numbers');
        } else {
          Alert.alert('Error', 'Style/Cuisine cannot contain numbers');
        }
        return;
    }
    console.log('Validation passed: Style does not contain numbers');

     if (!trimmedArea) {
        console.log('Validation failed: Area is empty');
        if (Platform.OS === 'web') {
          window.alert('Error: Area cannot be empty');
        } else {
          Alert.alert('Error', 'Area cannot be empty');
        }
        return;
    }
    console.log('Validation passed: Area is not empty');

    // 验证地址：不能只有数字 (假设地址应包含字母或其他字符)
    if (/^\d+$/.test(trimmedArea)) {
        console.log('Validation failed: Area contains only numbers');
        if (Platform.OS === 'web') {
            window.alert('Error: Area cannot consist only of numbers. Please include street name or other address details.');
        } else {
            Alert.alert('Error', 'Area cannot consist only of numbers', 'Please include street name or other address details.');
        }
        return;
    }
    console.log('Validation passed: Area does not contain only numbers');

    // 验证地址：一个简单的非空检查，更复杂的地址验证需要更具体的规则
    // 您可以根据需要添加更复杂的正则表达式来验证地址格式
    if (trimmedArea.length < 5) { // 示例：地址长度至少为5个字符
        console.log('Validation failed: Area is too short');
        if (Platform.OS === 'web') {
          window.alert('Error: Invalid Area format, please provide a more detailed address');
        } else {
          Alert.alert('Error', 'Invalid Area format, please provide a more detailed address');
        }
        return;
    }
    console.log('Validation passed: Area length is sufficient');

    console.log('All validations passed. Proceeding to save...');

    const newRestaurant = {
      id: Date.now().toString(),
      name: trimmedName,
      style: trimmedStyle,
      price,
      delivery,
      area: trimmedArea,
      rating, // Store rating as string
    };

    try {
      const updated = [...restaurants, newRestaurant];
      console.log('Attempting to save restaurants:', updated.length);
      await AsyncStorage.setItem('restaurants', JSON.stringify(updated));
      console.log('Successfully saved restaurants.');
      setRestaurants(updated);
      // Reset form
      setName('');
      setStyle('');
      setPrice(PRICE_RANGES[1]);
      setDelivery(false);
      setArea('');
      setRating(RATINGS[2]);
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      Alert.alert('Error', 'Failed to save restaurant.');
    }
  };

  const deleteRestaurant = async (id) => {
    console.log('Deleting restaurant with id:', id);
    // Find the restaurant name for better user feedback
    const restaurantToDelete = restaurants.find(r => r.id === id);
    if (!restaurantToDelete) {
      console.error('Restaurant not found with id:', id);
      Alert.alert('Error', 'Restaurant not found.');
      return;
    }

    // Use window.confirm for web platform, Alert.alert for others
    if (Platform.OS === 'web') {
        const confirmed = window.confirm(`Are you sure you want to delete "${restaurantToDelete.name}"?`);
        if (confirmed) {
            console.log('Inside delete confirmation onPress handler (Web)');
            try {
                console.log('Confirmed delete for restaurant:', restaurantToDelete.name);
                const updated = restaurants.filter((item) => item.id !== id);
                console.log('Filtered restaurants, new count:', updated.length);
                await AsyncStorage.setItem('restaurants', JSON.stringify(updated));
                console.log('AsyncStorage setItem successful after delete (Web).');
                setRestaurants(updated);
                console.log('setRestaurants called after delete (Web).');
                // Show success message (optional for web confirm)
                // alert(`"${restaurantToDelete.name}" has been deleted.`);
                console.log('Delete success (Web).');
            } catch (error) {
                console.error("Failed to delete restaurant (Web):", error);
                alert('Failed to delete restaurant. Please try again.');
            }
        }
    } else {
        Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${restaurantToDelete.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log('Inside delete confirmation onPress handler');
              try {
                console.log('Confirmed delete for restaurant:', restaurantToDelete.name);
                const updated = restaurants.filter((item) => item.id !== id);
                console.log('Filtered restaurants, new count:', updated.length);
                await AsyncStorage.setItem('restaurants', JSON.stringify(updated));
                console.log('AsyncStorage setItem successful after delete.');
                setRestaurants(updated);
                console.log('setRestaurants called after delete.');
                // Show success message
                Alert.alert('Success', `"${restaurantToDelete.name}" has been deleted.`);
                console.log('Delete success alert shown.');
              } catch (error) {
                console.error("Failed to delete restaurant:", error);
                Alert.alert('Error', 'Failed to delete restaurant. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  const renderItem = ({ item }) => {
    console.log('Rendering restaurant item:', item.id, item.name);
    return (
      <View style={styles.item}>
        <View style={styles.itemInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.details}>Style: {item.style} | Area: {item.area}</Text>
          <Text style={styles.details}>Price: {item.price} | Rating: {item.rating}/5 | Delivery: {item.delivery ? 'Yes' : 'No'}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log('Delete button pressed for:', item.id);
            deleteRestaurant(item.id);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
       {/* Wrap form in ScrollView in case of smaller screens */}
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Restaurant</Text>
        <CustomTextInput
          label="Restaurant Name *"
          value={name}
          onChangeText={setName}
          maxLength={50} // Increased length
        />
        <CustomTextInput
          label="Style/Cuisine *"
          value={style}
          onChangeText={setStyle}
          maxLength={30}
        />
         <CustomTextInput
          label="Area *"
          value={area}
          onChangeText={setArea}
          maxLength={30}
        />

        {/* Price Picker */}
        <Text style={styles.label}>Price Range *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={price}
            onValueChange={(itemValue) => setPrice(itemValue)}
            style={styles.picker}
          >
            {PRICE_RANGES.map((range) => (
              <Picker.Item key={range} label={range} value={range} />
            ))}
          </Picker>
        </View>

         {/* Rating Picker */}
        <Text style={styles.label}>Rating *</Text>
         <View style={styles.pickerContainer}>
            <Picker
                selectedValue={rating}
                onValueChange={(itemValue) => setRating(itemValue)}
                style={styles.picker}
            >
                {RATINGS.map((r) => (
                <Picker.Item key={r} label={`${r} / 5`} value={r} />
                ))}
            </Picker>
         </View>


        {/* Delivery Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Offers Delivery?</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={delivery ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setDelivery}
            value={delivery}
          />
        </View>

        <CustomButton
          text="Add Restaurant"
          onPress={saveRestaurant}
          buttonStyle={styles.addButton}
        />
      </ScrollView>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Existing Restaurants ({restaurants.length})</Text>
        <FlatList
          data={restaurants}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyListText}>No restaurants added yet.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background
  },
  formContainer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#dee2e6',
      maxHeight: '55%', // Limit form height
  },
  formTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: '#495057',
  },
  list: {
      flex: 1, // Take remaining space
      paddingHorizontal: 16,
  },
  listTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
      color: '#495057',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
      flex: 1,
      marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  details: {
    fontSize: 13,
    color: '#6c757d',
  },
  label: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    marginTop: 8,
  },
  pickerContainer: {
      borderWidth: 1,
      borderColor: '#ced4da',
      borderRadius: 4,
      marginBottom: 10,
      backgroundColor: '#fff', // Ensure picker background is white
  },
  picker: {
      height: 50, // Standard height
      width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  addButton: {
      marginTop: 10,
      marginBottom: 15, // Add some space below add button
      backgroundColor: '#28a745', // Green color
  },
  deleteButton: {
      backgroundColor: '#dc3545', // Red color
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 70,
      marginLeft: 8,
  },
  deleteButtonText: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '500',
  },
  emptyListText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#6c757d',
  },
  listContainer: {
      flex: 1,
      padding: 10,
  }
});

export default RestaurantsScreen;
