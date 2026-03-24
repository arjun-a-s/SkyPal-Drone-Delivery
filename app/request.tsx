import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// FIREBASE IMPORTS
import { getAuth } from 'firebase/auth';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function RequestScreen() {
  const router = useRouter();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "GPS access is required for drone precision.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Calculate a random price for simulation
  const price = pickup && drop ? '₹' + (Math.floor(Math.random() * 50) + 30) : '₹0';

  const handleRequest = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Login Required", "Please log in to start a mission.");
      return;
    }

    if (!pickup || !drop || !location) {
      Alert.alert("Missing Data", "Please wait for GPS lock and enter locations.");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create a unique Mission ID reference
      const missionRef = doc(collection(db, "landing_missions"));
      const newMissionId = missionRef.id;

      // 2. TWO-KEY GENERATION
      const receiverKey = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 3. Prepare the Dual-Authentication Mission Data
      const missionData = {
        missionId: newMissionId,
        senderUid: user.uid,
        
        // --- LOGIC STATES ---
        status: 'pending', // Set to pending to trigger drone response
        authStage: 'AWAITING_SENDER', 
        
        // --- LOCATIONS ---
        pickupName: pickup,
        dropName: drop,
        senderLat: location.coords.latitude,
        senderLng: location.coords.longitude,
        receiverLat: null,
        receiverLng: null,
        
        // --- AUTHENTICATION KEYS ---
        senderUnlockCode: newMissionId,   
        receiverUnlockCode: receiverKey, 
        
        // --- HARDWARE COMMANDS ---
        latchState: 'LOCKED', 
        droneCommand: 'IDLE',
        
        // --- TIMING (CRITICAL FOR PYTHON SYNC) ---
        // Using both names ensures the Python script 'order_by' never fails
        timestamp: serverTimestamp(), 
        createdAt: serverTimestamp(),
        
        price: price
      };

      // 4. Save to Firebase
      await setDoc(missionRef, missionData);

      setLoading(false);
      
      // 5. Navigate to MissionStatus
      router.replace({ 
        pathname: '/MissionStatus', 
        params: { 
          missionId: newMissionId,
          receiverKey: receiverKey 
        } 
      });

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Cloud Error", "Failed to register mission in SkyPal Cloud.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Mission</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>
            {location ? "🛰️ Satellite Link Active" : "🛰️ Establishing Satellite Link..."}
          </Text>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { transform: [{ rotate: '90deg' }] }]} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>PICKUP POINT (YOUR LOCATION)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Canteen Block A"
            placeholderTextColor="#5c6b7f"
            value={pickup}
            onChangeText={setPickup}
          />

          <View style={styles.connectorLine} />

          <Text style={styles.label}>DROP TARGET</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hostel Room 302"
            placeholderTextColor="#5c6b7f"
            value={drop}
            onChangeText={setDrop}
          />
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>ESTIMATED COST</Text>
            <Text style={styles.priceSub}>Includes autonomous navigation fee</Text>
          </View>
          <Text style={styles.priceValue}>{price}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handleRequest} 
          disabled={loading || !location}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00C6FF', '#0072FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, (!location) && { opacity: 0.5 }]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>INITIATE LAUNCH 🚀</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12161e' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#12161e' },
  backButton: { marginRight: 15, padding: 5 },
  backText: { color: 'white', fontSize: 24 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  mapPlaceholder: { height: 180, backgroundColor: '#0d1016', borderRadius: 20, borderWidth: 1, borderColor: '#2a3441', justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  mapText: { color: '#00C6FF', fontSize: 13, fontWeight: 'bold' },
  gridLine: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#2a3441' },
  formContainer: { marginBottom: 30 },
  label: { color: '#00C6FF', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#1a202c', borderWidth: 1, borderColor: '#2d3748', borderRadius: 12, padding: 16, color: 'white', fontSize: 16, marginBottom: 5 },
  connectorLine: { height: 20, width: 2, backgroundColor: '#2d3748', marginLeft: 20, marginVertical: 5 },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 198, 255, 0.05)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(0, 198, 255, 0.2)' },
  priceLabel: { color: '#00C6FF', fontWeight: 'bold', fontSize: 14 },
  priceSub: { color: '#5c6b7f', fontSize: 12, marginTop: 4 },
  priceValue: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  footer: { padding: 20, paddingBottom: 40 },
  button: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
});