//UserSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { ref, get } from 'firebase/database';
import { database } from '../utils/firebaseConfig'; // Import the database

export default function UserSelectionScreen({ navigation }) {
  const [name, setName] = useState('');
  const [userStop, setUserStop] = useState(null);

  const fetchUserStopData = async (userName) => {
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    try {
      const snapshot = await get(ref(database, `users/${userName.toLowerCase()}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.lat && data.lng && data.stop_no) { 
          setUserStop({
            latitude: data.lat,
            longitude: data.lng,
            stop_no: data.stop_no, 
          });
        } else {
          Alert.alert('Error', 'Stop data is incomplete for this user.');
        }
      } else {
        Alert.alert('Error', 'User not found.');
      }
    } catch (error) {
      console.error('Error fetching user stop data:', error);
      Alert.alert('Error', 'Failed to fetch stop data.');
    }
  };

  useEffect(() => {
    if (userStop) {
      navigation.navigate('MapScreen', { userStop });
    }
  }, [userStop, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: 'bold' }}>
        Enter student's registered name
      </Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{
          height: 50, 
          borderColor: 'gray',
          borderWidth: 1,
          borderRadius: 10, 
          marginBottom: 20,
          width: '80%',
          paddingLeft: 10,
          fontSize: 16,
          backgroundColor: '#f9f9f9', 
        }}
      />
      <Button title="Submit" onPress={() => fetchUserStopData(name)} color="#007BFF" />
    </View>
  );
}
