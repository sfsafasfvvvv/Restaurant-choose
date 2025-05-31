import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';

const PeopleScreen = ({ navigation }) => {
  const [people, setPeople] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    const data = await AsyncStorage.getItem('people');
    if (data) setPeople(JSON.parse(data));
  };

  const savePerson = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      console.log('Validation failed (People): Name is empty');
      if (Platform.OS === 'web') {
        window.alert('Error: Name cannot be empty');
      } else {
        Alert.alert('Error', 'Name cannot be empty');
      }
      return;
    }
    console.log('Validation passed (People): Name is not empty');

    // 验证姓名：首字母大写，不能包含数字
    if (!/^[A-Z][a-zA-Z\s]*$/.test(trimmedName)) {
        console.log('Validation failed (People): Invalid name format');
        if (Platform.OS === 'web') {
          window.alert('Error: Name must start with a capital letter and cannot contain numbers');
        } else {
          Alert.alert('Error', 'Name must start with a capital letter and cannot contain numbers');
        }
        return;
    }
    console.log('Validation passed (People): Name format is valid');

    const newPerson = { id: Date.now().toString(), name: trimmedName };
    const updated = [...people, newPerson];
    await AsyncStorage.setItem('people', JSON.stringify(updated));
    setPeople(updated);
    setName('');
  };

  const deletePerson = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this person?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          const updated = people.filter((item) => item.id !== id);
          await AsyncStorage.setItem('people', JSON.stringify(updated));
          setPeople(updated);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <CustomButton
        text="Delete"
        onPress={() => deletePerson(item.id)}
        buttonStyle={{ backgroundColor: '#dc3545' }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomTextInput
        label="Name"
        value={name}
        onChangeText={setName}
        maxLength={20}
      />
      <CustomButton
        text="Add Person"
        onPress={savePerson}
      />
      <FlatList
        data={people}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
});

export default PeopleScreen;
