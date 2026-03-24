import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import LiveTracking from './LiveTracking'; 

const { height } = Dimensions.get('window');

export default function MissionStatusScreen() {
  const { missionId, role } = useLocalSearchParams();
  const router = useRouter();
  const [missionData, setMissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!missionId) return;

    const unsub = onSnapshot(doc(db, "landing_missions", missionId as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMissionData(data);

        if (data.status === 'delivered') {
          router.replace({
            pathname: '/MissionComplete',
            params: { missionId, role }
          });
        }
      } else {
        Alert.alert("Error", "Mission document not found.");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [missionId]);

  const handleStartFlight = async () => {
    try {
      const missionRef = doc(db, "landing_missions", missionId as string);
      await updateDoc(missionRef, {
        status: 'in_flight',
        droneCommand: 'TAKEOFF', // Signal to Python script
        launchTime: new Date().toISOString()
      });
      Alert.alert("🚀 Launch Authorized", "The drone is now heading to the receiver.");
    } catch (error) {
      Alert.alert("Error", "Could not start the flight sequence.");
    }
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#00E5FF" />
    </View>
  );

  const isReceiverLinked = missionData?.receiverLat && missionData?.receiverLong;
  const isSender = role === 'SENDER';
  const isLatchClosed = missionData?.latchState === 'CLOSED';
  const showMap = missionData?.status === 'in_flight';

  // Logic for the Send Button: Must be sender, receiver must be linked, latch must be closed, and not already flying.
  const canSendDrone = isSender && isReceiverLinked && isLatchClosed && !showMap;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />

      {showMap ? (
        <View style={styles.mapContainer}>
             <LiveTracking missionData={missionData} />
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>FLIGHT CONTROL</Text>
          <Text style={styles.idSubText}>MISSION ID: {missionId}</Text>
          
          <View style={styles.statusBox}>
            <View style={styles.statusItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#00FF7F" />
              <Text style={styles.statusText}>Sender Geotag Verified</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.statusItem}>
              <MaterialCommunityIcons 
                name={isReceiverLinked ? "check-circle" : "timer-sand"} 
                size={24} 
                color={isReceiverLinked ? "#00FF7F" : "rgba(255,255,255,0.4)"} 
              />
              <Text style={styles.statusText}>
                {isReceiverLinked ? "Receiver Linked" : "Awaiting Receiver..."}
              </Text>
            </View>
            <View style={styles.line} />
            <View style={styles.statusItem}>
              <MaterialCommunityIcons 
                name={isLatchClosed ? "package-variant-closed" : "package-variant"} 
                size={24} 
                color={isLatchClosed ? "#00FF7F" : "#FFC107"} 
              />
              <Text style={styles.statusText}>
                {isLatchClosed ? "Package Secured" : "Awaiting QR Latch Close..."}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bottomSection}>
        <View style={styles.actionContainer}>
          {isSender ? (
            <TouchableOpacity 
              style={[styles.launchBtn, !canSendDrone && styles.launchBtnDisabled]} 
              onPress={handleStartFlight}
              disabled={!canSendDrone}
            >
              <LinearGradient 
                colors={canSendDrone ? ['#FF4B2B', '#FF416C'] : ['#434343', '#282828']} 
                style={styles.btnGradient}
              >
                <MaterialCommunityIcons 
                  name={showMap ? "airplane-takeoff" : (isLatchClosed ? "rocket-launch" : "lock-outline")} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.btnText}>
                  {showMap ? "DRONE EN ROUTE" : (isLatchClosed ? "SEND DRONE TO RECEIVER 🚁" : "SECURE LATCH TO START")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitState}>
              <ActivityIndicator color="#00FF7F" style={{ marginBottom: 10 }} />
              <Text style={styles.waitText}>
                {showMap ? "SkyPal is en route to your location!" : "Standing by for Sender to secure package."}
              </Text>
            </View>
          )}
        </View>

        {!showMap && (
          <TouchableOpacity 
            style={styles.footerLink} 
            onPress={() => router.push({ pathname: '/MissionQR', params: { missionId, role } })}
          >
            <MaterialCommunityIcons name="qrcode" size={18} color="#00E5FF" />
            <Text style={styles.footerLinkText}>Access Latch QR Key</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: height * 0.7, width: '100%', overflow: 'hidden' },
  loader: { flex: 1, backgroundColor: '#020024', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, alignItems: 'center', marginTop: 60 },
  title: { color: 'white', fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  idSubText: { color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 11, marginTop: 5 },
  statusBox: { 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    padding: 25, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 40,
    width: '100%'
  },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { color: 'white', fontSize: 16, fontWeight: '600' },
  line: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 11, marginVertical: 4 },
  bottomSection: { padding: 30, paddingBottom: 40 },
  actionContainer: { marginBottom: 20, width: '100%', alignItems: 'center' },
  launchBtn: { borderRadius: 15, overflow: 'hidden', elevation: 8, width: '100%' },
  launchBtnDisabled: { opacity: 0.6 },
  btnGradient: { flexDirection: 'row', paddingVertical: 18, justifyContent: 'center', alignItems: 'center', gap: 12 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  waitState: { 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'rgba(0,255,127,0.1)', 
    borderRadius: 15, 
    width: '100%',
    borderWidth: 1,
    borderColor: '#00FF7F'
  },
  waitText: { color: '#00FF7F', textAlign: 'center', fontWeight: '500' },
  footerLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  footerLinkText: { color: '#00E5FF', fontWeight: 'bold', fontSize: 14 }
});