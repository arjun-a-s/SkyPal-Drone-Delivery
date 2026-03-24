import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// FIREBASE IMPORTS
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Added getDoc for safety check
import { db } from '../firebaseConfig';

export default function ReceiverCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  
  // 1. Get the missionId passed from the Join Mission screen
  const { missionId } = useLocalSearchParams();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
          SkyPal needs camera access to verify your landing zone.
        </Text>
        <TouchableOpacity style={styles.captureBtn} onPress={requestPermission}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takeReceiverPhoto = async () => {
    if (!missionId) {
      Alert.alert("Error", "No Mission ID detected. Please restart the connection.");
      return;
    }

    if (cameraRef.current) {
      try {
        // 2. Get Receiver's high-accuracy GPS
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = currentLocation.coords;

        // 3. Safety Check & Update
        const missionRef = doc(db, "landing_missions", missionId as string);
        const missionSnap = await getDoc(missionRef);

        if (missionSnap.exists()) {
          await updateDoc(missionRef, {
            receiverLat: latitude,
            receiverLng: longitude,
            status: "receiver_ready" // Triggers the Sender's launch button instantly
          });

          // 4. Navigate to MissionQR to show the Latch Key
          router.push({
            pathname: '/MissionQR',
            params: { 
              missionId: missionId as string,
              lat: latitude.toString(),
              lng: longitude.toString(),
              timestamp: new Date().toISOString()
            }
          });
        } else {
          Alert.alert("Mission Expired", "This mission is no longer active.");
          router.replace('/home');
        }

      } catch (error) {
        console.error(error);
        Alert.alert("Verification Error", "Could not lock landing coordinates. Check GPS settings.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.headerBadge}>
             <Text style={styles.scanText}>LANDING ZONE VERIFICATION</Text>
             <Text style={styles.idText}>ID: {missionId}</Text>
          </View>
          
          <View style={styles.reticle}>
            <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
            <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 }]} />
          </View>

          <TouchableOpacity style={styles.captureBtn} onPress={takeReceiverPhoto}>
            <View style={styles.captureInternal} />
          </TouchableOpacity>

          <Text style={styles.hintText}>Point at the exact landing spot</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  headerBadge: { position: 'absolute', top: 60, alignItems: 'center' },
  scanText: { color: '#00E5FF', fontWeight: 'bold', letterSpacing: 2, fontSize: 14 },
  idText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },
  reticle: { width: 250, height: 250, borderRadius: 20, borderColor: 'rgba(0,229,255,0.3)', borderWidth: 1, borderStyle: 'dashed' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#00E5FF' },
  captureBtn: { 
    position: 'absolute', 
    bottom: 50, 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 4, 
    borderColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  captureInternal: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'white' },
  hintText: { color: 'white', position: 'absolute', bottom: 140, opacity: 0.6, fontSize: 12 }
});