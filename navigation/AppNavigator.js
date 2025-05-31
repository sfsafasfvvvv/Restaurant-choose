import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import PeopleScreen from '../screens/PeopleScreen';
// Import new screens (or placeholders for now)
import DecisionStartScreen from '../screens/DecisionStartScreen'; // Assuming created
import WhoIsGoingScreen from '../screens/WhoIsGoingScreen'; // Assuming created
import RestaurantChoiceScreen from '../screens/RestaurantChoiceScreen'; // Assuming created
import EnjoyMealScreen from '../screens/EnjoyMealScreen'; // Assuming created
import RestaurantsScreen from '../screens/RestaurantsScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator(); // Create Stack Navigator instance

// Define the Stack Navigator for the Decision flow
const DecisionStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DecisionStart" component={DecisionStartScreen} />
    <Stack.Screen name="WhoIsGoing" component={WhoIsGoingScreen} />
    <Stack.Screen name="RestaurantChoice" component={RestaurantChoiceScreen} />
    <Stack.Screen name="EnjoyMeal" component={EnjoyMealScreen} />
  </Stack.Navigator>
);

export const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Decision"
      screenOptions={{
        tabBarActiveTintColor: '#f70000',
        tabBarInactiveTintColor: '#666666',
        tabBarShowIcon: true,
        tabBarPosition: Platform.OS === 'android' ? 'top' : 'bottom',
        tabBarStyle: {
          paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#f70000',
        },
      }}
    >
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarLabel: 'People',
        }}
      />
      <Tab.Screen
        name="Decision"
        component={DecisionStackNavigator} // Use the Stack Navigator here
        options={{
          tabBarLabel: 'Choose',
        }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{
          tabBarLabel: 'Restaurant',
        }}
      />
    </Tab.Navigator>
  )}
