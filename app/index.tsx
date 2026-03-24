import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DroneLogo from './DroneLogo';

// FIREBASE IMPORTS
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [pilotName, setPilotName] = useState('Pilot');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for entering Mission ID (Receiver flow)
  const [joinId, setJoinId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsVerified(user.emailVerified);
        try {
          const docRef = doc(db, "pilots", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            // Updated to use a generic 'Name' variable if needed, 
            // but currently fetching from Firestore 'firstName'
            setPilotName(docSnap.data().firstName || 'Pilot');
          }
        } catch (error) {
          console.error("Firestore Error:", error);
        }
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * HANDLER FOR PHONE B (RECEIVER)
   * This ensures the receiver goes to 'receiver-info' to geotag their location
   * before they ever see the flight status.
   */
  const handleJoinMission = async () => {
    if (!joinId.trim()) {
      Alert.alert("Error", "Please enter a Mission ID.");
      return;
    }

    setIsLinking(true);
    try {
      const docRef = doc(db, "landing_missions", joinId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const missionData = docSnap.data();

        // Check if mission is already finished
        if (missionData.status === 'completed') {
           Alert.alert("Mission Over", "This mission has already been completed.");
           return;
        }

        // FORCE Phone B to the Receiver Geotagging screen
        router.push({
          pathname: '/receiver-info', //goes to briefing/geotagging first
          params: { missionId: joinId, role: 'RECEIVER' }
        });
      } else {
        Alert.alert("Not Found", "Invalid Mission ID. Please check the ID shared by the sender.");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Could not connect to SkyPal servers.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setIsVerified(auth.currentUser.emailVerified);
      if (auth.currentUser.emailVerified) {
        Alert.alert("Success", "Identity Verified!");
      } else {
        Alert.alert("Still Pending", "Please check your spam folder.");
      }
    }
  };

  const handleResendEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        Alert.alert("Sent!", "Verification link sent to your inbox.");
      } catch (error: any) {
        Alert.alert("Wait a moment", "Try again in a few minutes.");
      }
    }
  };

  if (loading) return (
    <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#00E5FF" />
    </View>
  );

  if (!isVerified) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#004d40', '#000000']} style={StyleSheet.absoluteFill} />
        <View style={styles.verifyContainer}>
          <Text style={styles.mainButtonIcon}>⚠️</Text>
          <Text style={styles.username}>Verify Identity</Text>
          <Text style={styles.greeting}>Please check your spam folder for the SkyPal email.</Text>
          
          <TouchableOpacity style={styles.mainButtonShadow} onPress={handleRefreshVerification}>
             <LinearGradient colors={['#00C6FF', '#0072FF']} style={styles.buttonInner}>
              <Text style={styles.buttonText}>I've Verified - Refresh</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendEmail} style={{ marginTop: 25 }}>
            <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Resend Email</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => auth.signOut().then(() => router.replace('/login'))}>
            <Text style={[styles.linkText, {marginTop: 20}]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back, Pilot</Text>
            <Text style={styles.username}>{pilotName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <DroneLogo width={50} height={50} />
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SkyPal Systems Online</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Your Role</Text>

        <View style={styles.buttonContainer}>
          {/* SENDER CARD */}
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => router.push('/sender-info')}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={70} color="#00FF7F" />
            <Text style={styles.roleText}>SENDER</Text>
            <Text style={styles.subText}>Initiate a new delivery mission</Text>
          </TouchableOpacity>

          {/* RECEIVER CARD */}
          <View style={styles.roleCard}>
            <MaterialCommunityIcons name="map-marker-radius" size={70} color="#00E5FF" />
            <Text style={styles.roleText}>RECEIVER</Text>
            
            <TextInput 
              style={styles.joinInput}
              placeholder="Enter Mission ID"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={joinId}
              onChangeText={setJoinId}
              autoCapitalize="none"
              editable={!isLinking}
            />

            <TouchableOpacity 
              style={[styles.joinBtn, isLinking && {opacity: 0.7}]} 
              onPress={handleJoinMission}
              disabled={isLinking}
            >
              {isLinking ? (
                <ActivityIndicator color="#020024" />
              ) : (
                <Text style={styles.joinBtnText}>LINK LANDING ZONE</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.subText}>Enter the ID shared by the sender to set landing coordinates</Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyHeader}>Activity Log</Text>
          <TouchableOpacity 
            style={styles.historyCard} 
            onPress={() => router.push('/MissionHistory')}
          >
            <View style={styles.historyIconBox}>
              <MaterialCommunityIcons name="clipboard-text-clock" size={24} color="#A0D8FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>Mission History</Text>
              <Text style={styles.historySub}>View past coordinates & logs</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
           style={styles.signOutBtn} 
           onPress={() => auth.signOut().then(() => router.replace('/login'))}
        >
          <Text style={styles.linkText}>Sign Out Pilot</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 60 },
  verifyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 16, color: '#A0D8FF' },
  username: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  avatarContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, padding: 5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,255,127,0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 40 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF7F', marginRight: 8 },
  statusText: { color: '#00FF7F', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 20, opacity: 0.8 },
  buttonContainer: { gap: 20 },
  roleCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.07)', 
    padding: 25, 
    borderRadius: 25, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  roleText: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 10, letterSpacing: 1 },
  subText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 10, textAlign: 'center' },
  joinInput: { 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    width: '100%', 
    borderRadius: 12, 
    padding: 12, 
    color: 'white', 
    marginTop: 15, 
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)'
  },
  joinBtn: { 
    backgroundColor: '#00E5FF', 
    width: '100%', 
    padding: 15, 
    borderRadius: 12, 
    marginTop: 10, 
    alignItems: 'center' 
  },
  joinBtnText: { color: '#020024', fontWeight: 'bold', letterSpacing: 1 },
  historySection: { marginTop: 35 },
  historyHeader: { color: 'white', fontSize: 14, fontWeight: 'bold', marginBottom: 15, opacity: 0.6, letterSpacing: 1 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  historyIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(160, 216, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  historySub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  mainButtonShadow: { borderRadius: 20, marginTop: 30 },
  buttonInner: { padding: 15, borderRadius: 10, width: 220, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  mainButtonIcon: { fontSize: 40, marginBottom: 20 },
  linkText: { color: '#A0D8FF', fontWeight: '600' },
  signOutBtn: { marginTop: 40, alignItems: 'center', marginBottom: 50 }
});