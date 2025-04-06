// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';
import MapScreen from './screens/MapScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
  <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
  <Stack.Screen name="UserSelection" component={UserSelectionScreen} options={{ headerShown: false }} />
  <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
</Stack.Navigator>

    </NavigationContainer>
  );
}
