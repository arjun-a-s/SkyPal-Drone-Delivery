import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { db } from '../firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function FlightControl() {
  const { missionId } = useLocalSearchParams();
  const router = useRouter();
  
  const [missionData, setMissionData] = useState<any>(null);

  useEffect(() => {
    if (!missionId) return;

    // Listen to LIVE updates from the Python Simulator
    const unsubscribe = onSnapshot(doc(db, "landing_missions", missionId as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMissionData({ ...data, id: docSnap.id });

        // Auto-navigate to Success screen if Python marks it delivered
        if (data.status === 'delivered') {
          setTimeout(() => {
            router.push({ pathname: '/MissionSuccess', params: { missionId } });
          }, 1500);
        }
      }
    });

    return () => unsubscribe();
  }, [missionId]);

  // Trigger the Python Script by changing status to 'in_flight'
  const startFlight = async () => {
    if (!missionId) return;
    try {
      const missionRef = doc(db, "landing_missions", missionId as string);
      await updateDoc(missionRef, {
        status: 'in_flight'
      });
      console.log("🚀 Mission Initiated. Waiting for Drone Simulator...");
    } catch (error) {
      console.error("Error starting flight:", error);
    }
  };

  if (!missionData) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: 'white' }}>Connecting to SkyPal Satellite...</Text>
      </View>
    );
  }

  // Use live coordinates from Python script, fallback to sender location
  const droneLoc = {
    latitude: missionData.currentLat || missionData.senderLat,
    longitude: missionData.currentLong || missionData.senderLng,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          ...droneLoc,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {/* CARTO DB VOYAGER TILES - Fixes the 403 Access Blocked Error */}
        <UrlTile
          urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          {...({ 
            subdomains: ['a', 'b', 'c', 'd'],
            tileSize: 256 
          } as any)}
          maximumZ={20}
        />

        <Polyline
          coordinates={[
            { latitude: missionData.senderLat, longitude: missionData.senderLng },
            { latitude: missionData.receiverLat, longitude: missionData.receiverLng }
          ]}
          strokeColor="#00E5FF"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />

        <Marker coordinate={{ latitude: missionData.senderLat, longitude: missionData.senderLng }}>
          <MaterialCommunityIcons name="home-map-marker" size={30} color="#090979" />
        </Marker>

        <Marker coordinate={{ latitude: missionData.receiverLat, longitude: missionData.receiverLng }}>
          <MaterialCommunityIcons name="map-marker-check" size={30} color="#00FF7F" />
        </Marker>

        <Marker coordinate={droneLoc} flat anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.droneMarkerShadow}>
            <MaterialCommunityIcons name="navigation" size={40} color="#00FF7F" />
          </View>
        </Marker>
      </MapView>

      <View style={styles.hudContainer}>
        <LinearGradient colors={['rgba(2,0,36,0.8)', 'transparent']} style={styles.topHud}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ALTITUDE</Text>
            <Text style={styles.statValue}>{missionData.altitude || 0}m</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={[styles.statValue, { fontSize: 14 }]}>
              {missionData.status?.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>BATTERY</Text>
            <Text style={[styles.statValue, { color: '#00FF7F' }]}>94%</Text>
          </View>
        </LinearGradient>

        <View style={styles.bottomHud}>
          <Text style={styles.missionText}>MISSION ID: {missionId?.toString().substring(0, 12)}</Text>
          
          {missionData.status === 'pending' || missionData.status === 'waiting' ? (
            <TouchableOpacity style={styles.launchBtn} onPress={startFlight}>
              <Text style={styles.launchText}>CONFIRM & TAKEOFF</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.flightInfo}>
              <Text style={styles.flightStatus}>
                {missionData.status === 'in_flight' ? "🛰️ DRONE IS EN ROUTE" : "✅ ARRIVED AT DESTINATION"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020024' },
  hudContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', pointerEvents: 'box-none' },
  topHud: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 60, paddingBottom: 40 },
  statBox: { alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold' },
  statValue: { color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  bottomHud: { backgroundColor: 'rgba(2,0,36,0.9)', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  missionText: { color: '#00E5FF', fontWeight: 'bold', marginBottom: 15, textAlign: 'center', fontSize: 12 },
  launchBtn: { backgroundColor: '#00FF7F', padding: 20, borderRadius: 15, alignItems: 'center' },
  launchText: { color: '#020024', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  flightInfo: { padding: 15, alignItems: 'center' },
  flightStatus: { color: '#00FF7F', fontWeight: 'bold', fontSize: 16 },
  droneMarkerShadow: {
    shadowColor: '#00FF7F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  }
});