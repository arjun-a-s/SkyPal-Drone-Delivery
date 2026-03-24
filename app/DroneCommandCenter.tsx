import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { db } from '../firebaseConfig';

export default function DroneCommandCenter() {
  const { missionId } = useLocalSearchParams();
  const router = useRouter();
  const [missionData, setMissionData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!missionId) return;

    const unsubscribe = onSnapshot(doc(db, "landing_missions", missionId as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const oldState = missionData?.latchState;
        setMissionData(data);

        // --- NEW UPDATE: HANDSHAKE LOGIC ---
        
        // Step 1: Detect Latch Opening
        if (oldState === 'LOCKED' && data.latchState === 'UNLOCKED') {
          Alert.alert("🔓 Latch Opened", "The drone latch is now open. Please load your package.");
        }

        // Step 2: Detect Latch Closing (The 2nd Scan)
        if (oldState === 'UNLOCKED' && data.latchState === 'CLOSED') {
          Alert.alert("🔒 Latch Secured", "Latch is closed and locked. You may now initiate the flight.");
          setShowQR(false); // Hide QR only after the 2nd scan is successful
        }
      }
    });

    return () => unsubscribe();
  }, [missionId, missionData?.latchState]);

  const initiateLaunch = async () => {
    if (!missionId) return;
    const nextCommand = missionData?.droneCommand === 'GOTO_SENDER' ? 'GOTO_RECEIVER' : 'RETURN_HOME';
    
    try {
      await updateDoc(doc(db, "landing_missions", missionId as string), {
        droneCommand: nextCommand,
        status: 'in_flight'
      });
      
      Alert.alert("🚀 Launch Confirmed", "Drone is heading to target coordinates.");
      router.push({ pathname: '/FlightControl', params: { missionId } });
    } catch (e) {
      Alert.alert("Error", "Communication failed.");
    }
  };

  if (!missionData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00C6FF" />
        <Text style={{color: 'white', marginTop: 10}}>Connecting to SkyPal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0d1016', '#1a202c']} style={StyleSheet.absoluteFill} />
      
      {/* 1. TELEMETRY BAR */}
      <View style={styles.telemetryBar}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="battery-high" size={20} color="#00FF7F" />
          <Text style={styles.statText}>{missionData.battery || '88'}%</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="signal-variant" size={20} color="#00C6FF" />
          <Text style={styles.statText}>42ms</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="satellite-variant" size={20} color="#00C6FF" />
          <Text style={styles.statText}>GPS: LOCK</Text>
        </View>
      </View>

      {/* 2. DRONE STATUS CARD */}
      <View style={styles.mainCard}>
        <Text style={styles.missionLabel}>MISSION ID: {missionId?.toString().substring(0,8)}</Text>
        
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: missionData.status === 'in_flight' ? '#00FF7F' : '#FFA500' }]} />
          <Text style={styles.statusText}>{missionData.status?.toUpperCase()}</Text>
        </View>
        
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="drone" 
              size={120} 
              color={missionData.latchState === 'UNLOCKED' ? "#00FF7F" : "white"} 
            />
            <MaterialCommunityIcons 
              name={missionData.latchState === 'UNLOCKED' ? "lock-open-variant" : "lock"} 
              size={30} 
              color={missionData.latchState === 'UNLOCKED' ? "#00FF7F" : "#FF4B2B"}
              style={styles.lockIcon}
            />
        </View>
        
        <Text style={styles.instructionText}>
          {missionData.latchState === 'UNLOCKED' 
            ? "LATCH OPEN: Scan QR again to CLOSE after loading." 
            : missionData.latchState === 'CLOSED'
              ? "LATCH SECURED: Ready for takeoff."
              : "Drone arrived. Use QR to open latch."}
        </Text>
      </View>

      {/* 3. HARDWARE CONTROLS */}
      <View style={styles.controlPanel}>
        {showQR ? (
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>
              {missionData.latchState === 'UNLOCKED' ? "SCAN TO CLOSE LATCH" : "SCAN TO OPEN LATCH"}
            </Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={missionData.senderUnlockCode || "SKP-DEFAULT"}
                size={180}
              />
            </View>
            <Text style={styles.qrStatusText}>
               Status: {missionData.latchState === 'UNLOCKED' ? "Waiting for 2nd Scan..." : "Waiting for 1st Scan..."}
            </Text>
            <TouchableOpacity onPress={() => setShowQR(false)} style={styles.closeQr}>
              <Text style={{color: '#FF4B2B', fontWeight: 'bold'}}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, missionData.latchState === 'CLOSED' && styles.disabledBtn]} 
              onPress={() => setShowQR(true)}
              disabled={missionData.latchState === 'CLOSED'}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
              <Text style={styles.btnText}>
                {missionData.latchState === 'UNLOCKED' ? "SCAN TO CLOSE LATCH" : "OPEN LATCH (QR CODE)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.launchBtn, missionData.latchState !== 'CLOSED' && styles.launchDisabled]} 
              onPress={initiateLaunch}
              disabled={missionData.latchState !== 'CLOSED'}
            >
              <Text style={styles.launchBtnText}>CONFIRM & LAUNCH 🚀</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12161e' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12161e' },
  telemetryBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 60, paddingBottom: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: 'white', fontSize: 11, fontWeight: '700' },
  mainCard: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  missionLabel: { color: '#5c6b7f', fontSize: 12, marginBottom: 10, letterSpacing: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 12, fontWeight: '800' },
  iconContainer: { marginVertical: 30, alignItems: 'center' },
  lockIcon: { position: 'absolute', bottom: -10, right: -10, backgroundColor: '#12161e', padding: 5, borderRadius: 20 },
  instructionText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 15, lineHeight: 22, marginTop: 10 },
  controlPanel: { padding: 30, paddingBottom: 50 },
  actionBtn: { flexDirection: 'row', gap: 10, backgroundColor: '#1a202c', borderWidth: 1, borderColor: '#00C6FF', padding: 22, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  disabledBtn: { opacity: 0.5, borderColor: '#5c6b7f' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  launchBtn: { backgroundColor: '#00FF7F', padding: 22, borderRadius: 18, alignItems: 'center', elevation: 10 },
  launchDisabled: { backgroundColor: '#1a202c', opacity: 0.4 },
  launchBtnText: { color: '#020024', fontWeight: '900', fontSize: 16 },
  qrBox: { backgroundColor: 'white', padding: 25, borderRadius: 30, alignItems: 'center', elevation: 20 },
  qrTitle: { color: '#020024', fontWeight: '900', fontSize: 12, marginBottom: 10, letterSpacing: 1 },
  qrStatusText: { color: '#7f8c8d', fontSize: 11, marginTop: 15 },
  qrWrapper: { padding: 10, backgroundColor: 'white' },
  closeQr: { marginTop: 20, padding: 10 }
});