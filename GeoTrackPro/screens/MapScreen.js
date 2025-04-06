//MapScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase Database Initialization
const db = getDatabase();

const schoolLocation = { latitude: 17.411805, longitude: 78.398634 };

export default function MapScreen({ route }) {
  const { userStop } = route.params; 
  const [busLocation, setBusLocation] = useState(schoolLocation); // Initial bus location
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [hasAlarmTriggered, setHasAlarmTriggered] = useState(false);
  const [isBusStopped, setIsBusStopped] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0); 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fixedStops, setFixedStops] = useState([]); 
  const [eta, setEta] = useState(null);
  const [busStatus, setBusStatus] = useState("Bus started to Stop 1...");

  // Calculate distance between two coordinates
  const getDistance = (loc1, loc2) => {
    const rad = Math.PI / 180;
    const dlat = (loc2.latitude - loc1.latitude) * rad;
    const dlon = (loc2.longitude - loc1.longitude) * rad;
    const a = Math.sin(dlat / 2) ** 2 +
      Math.cos(loc1.latitude * rad) * Math.cos(loc2.latitude * rad) * Math.sin(dlon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000; // meters
  };

  // Fetch stops from Firebase
  const fetchStops = async () => {
    try {
      const snapshot = await get(ref(db, 'stops'));
      if (snapshot.exists()) {
        const stopsData = snapshot.val();
        const stopsArray = Object.values(stopsData).map(({ lat, lng}, index) => ({
          stop_no: index + 1,
          latitude: lat,
          longitude: lng,
        }));

        setFixedStops([...stopsArray, schoolLocation]); 
        console.log("Stops fetched:", stopsArray);
      } else {
        Alert.alert('Error', 'No stops data found.');
      }
    } catch (error) {
      console.error('Error fetching stops:', error);
      Alert.alert('Error', 'Failed to fetch stops data.');
    }
  };

  // Play alarm sound
  const playAlarm = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/alarm.mp3'));
      await sound.playAsync();
      setTimeout(() => sound.stopAsync(), 10000);
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  };

  // Function to handle parent confirmation
  const handleParentResponse = (response) => {
    if (response === "yes") {
      setIsBusStopped(false);
    } else {
      Alert.alert("The bus is moving to the next stop.", "You can board there.");
      setIsBusStopped(false); 
    }
    setShowConfirmation(false);
  };
  

  const calculateETA = (currentLoc, targetLoc) => {
    const distance = getDistance(currentLoc, targetLoc);
    const speed = 15; // km/h
    return ((distance / 1000) / speed * 60).toFixed(2); // minutes
  };

  // Check proximity to target location
  const checkProximity = (busLoc) => {
    const distanceToTargetChild = getDistance(busLoc, userStop);

    if (distanceToTargetChild < 50 && !hasAlarmTriggered) {
      setBusStatus(`Bus is near to your location`);
      playAlarm();
      setHasAlarmTriggered(true);
    }

    if (distanceToTargetChild < 10 && !isBusStopped) {
      setIsBusStopped(true);
      setWaitingTime(15); 

      // Countdown Timer
      const countdown = setInterval(() => {
        setWaitingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setShowConfirmation(true);
      
            //  Update bus status when countdown ends
            if (currentStopIndex < fixedStops.length - 1) {
              setBusStatus(`Bus is heading to Stop ${currentStopIndex + 2}`);
            } else {
              setBusStatus(`Bus is heading to School`);
            }
      
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  // Update bus status when the bus stops
  useEffect(() => {
    if (isBusStopped) {
      if (currentStopIndex < fixedStops.length - 1) {
        setBusStatus(`Bus is waiting`);
      } else {
        setBusStatus(`Bus has reached the school`);
      }
    }
  }, [isBusStopped, currentStopIndex, fixedStops]);

  // Move the bus along the route
  const moveBus = () => {
    if (isBusStopped) return;

    const nextStop = fixedStops[currentStopIndex] || schoolLocation;

    const latDiff = (nextStop.latitude - busLocation.latitude) / 25;
    const lonDiff = (nextStop.longitude - busLocation.longitude) / 25;

    const newLocation = {
      latitude: busLocation.latitude + latDiff,
      longitude: busLocation.longitude + lonDiff,
    };

    setBusLocation(newLocation);
    checkProximity(newLocation); // Check proximity to user stop
  

    if (getDistance(newLocation, nextStop) < 10) {
      if (!isBusStopped) {
        if (currentStopIndex < fixedStops.length - 2) {
          setCurrentStopIndex(currentStopIndex + 1);
          setBusStatus(`Bus is heading to Stop ${currentStopIndex + 2}`);

        } else if (currentStopIndex === fixedStops.length - 2) {
          setCurrentStopIndex(currentStopIndex + 1);
          setBusStatus(`Bus is heading back to School`);
        } else {
          Alert.alert(`Bus has reached the school.`);
          setIsBusStopped(true);
        }
    }}
    
  };

  useEffect(() => {
    fetchStops();
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBusStopped) {
        moveBus();
      }
      setEta(calculateETA(busLocation, userStop));
    }, 500);

    return () => clearInterval(interval);
  }, [busLocation, isBusStopped, currentStopIndex, fixedStops]);

  

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: busLocation.latitude,
          longitude: busLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Bus location */}
        <Marker coordinate={busLocation} title="Bus Location" pinColor="yellow" />
        <Marker coordinate={schoolLocation} title="School" pinColor="green" />
         

        {/* Render the user stop as a red marker */}
        {userStop && (
          <Marker coordinate={userStop} title="Your Stop" pinColor="red" />
        )}

        {/* Render all other stops */}
        {fixedStops.map((stop, index) => {
          if (stop.latitude !== userStop.latitude || stop.longitude !== userStop.longitude) {
            return (
              <Marker key={index} coordinate={stop} title={`Stop ${stop.stop_no}`} pinColor="blue" />
            );
          }
        })}

        {/* School location */}
        <Marker coordinate={schoolLocation} title="School" pinColor="green" />
      </MapView>

      {/* Countdown Timer */}
      {isBusStopped && waitingTime > 0 && (
        <Text style={{
          position: 'absolute', top: 170, alignSelf: 'center',
          backgroundColor: 'rgba(255, 0, 0, 0.7)', color: 'white', padding: 10,
        }}>
          Bus waiting time: {waitingTime}s
        </Text>
      )}

      {/* Parent Confirmation Alert */}
      {showConfirmation && (
        Alert.alert(
          "Has your child boarded the bus?",
          "",
          [
            { text: "Yes", onPress: () => handleParentResponse("yes") },
            { text: "No", onPress: () => handleParentResponse("no") }
          ]
        )
      )}


      <Text style={{
              position: 'absolute', top: 70, alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 10,
            }}>
              {busStatus}
            </Text>

<Text style={{
        position: 'absolute', top: 120, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 10,
      }}>
        {eta ? `ETA: ${eta} minutes` : 'Calculating ETA...'}
      </Text>

      {userStop && (
  <Text style={{
    position: 'absolute', top: 20, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 10,
  }}>
    Your stop number: {userStop.stop_no}
  </Text>
)}


    </View>
  );
}
