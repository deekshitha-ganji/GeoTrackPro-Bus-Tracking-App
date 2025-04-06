//HomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate loading time (3 seconds)
    const timer = setTimeout(() => {
      navigation.replace('UserSelection'); // Navigate to UserSelectionScreen after loading
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* App Icon */}
      <Image source={require('../assets/app_icon.png')} style={styles.logo} />

      {/* App Name */}
      <Text style={styles.title}>GeoTrackPro</Text>

      {/* Loading Indicator */}
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 150, 
    height: 150, 
    marginBottom: 10, 
    resizeMode: 'contain', 
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
});

export default HomeScreen;
