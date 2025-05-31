import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { MainTabs } from './navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MainTabs />
    </NavigationContainer>
  );
}
