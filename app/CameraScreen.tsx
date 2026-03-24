import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function CameraScreen() {
  const router = useRouter();
  const { role, missionId } = useLocalSearchParams(); // role is 'SENDER' or 'RECEIVER'
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center' }}>We need camera access to geotag the mission.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}><Text>Grant Permission</Text></TouchableOpacity>
      </View>
    );
  }

  const takePhotoAndGeotag = async () => {
    setIsProcessing(true);
    try {
      // 1. Get GPS Coordinates
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "GPS is required for autonomous landing.");
        setIsProcessing(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      // 2. Logic Split: SENDER vs RECEIVER
      if (role === 'SENDER') {
        // CREATE NEW MISSION
        const docRef = await addDoc(collection(db, "landing_missions"), {
          senderLat: latitude,
          senderLong: longitude,
          status: 'awaiting_receiver',
          createdAt: serverTimestamp(),
        });

        router.push({
          pathname: '/MissionQR',
          params: { missionId: docRef.id, role: 'SENDER' }
        });

      } else if (role === 'RECEIVER' && missionId) {
        // UPDATE EXISTING MISSION
        const missionRef = doc(db, "landing_missions", missionId as string);
        await updateDoc(missionRef, {
          receiverLat: latitude,
          receiverLong: longitude,
          status: 'ready_for_handshake', // Signals to Sender that flight can start
          updatedAt: serverTimestamp(),
        });

        router.push({
          pathname: '/MissionQR',
          params: { missionId: missionId, role: 'RECEIVER' }
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Mission Error", "Failed to sync geotagged data.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.targetText}>
            {role === 'SENDER' ? "POINT AT LOADING ZONE" : "POINT AT LANDING ZONE"}
          </Text>
          
          <TouchableOpacity 
            style={styles.captureBtn} 
            onPress={takePhotoAndGeotag}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#020024" />
            ) : (
              <View style={styles.innerCircle} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  targetText: { color: '#00FF7F', fontSize: 14, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: 'rgba(255,255,255,0.3)' },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', borderWidth: 2, borderColor: '#020024' },
  btn: { backgroundColor: '#00E5FF', padding: 15, marginTop: 20, borderRadius: 10 }
});