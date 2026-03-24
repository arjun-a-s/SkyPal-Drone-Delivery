import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function MissionQR() {
  const { missionId, role } = useLocalSearchParams(); 
  const router = useRouter();

  // The QR contains the ID and the Role for the Raspberry Pi to read
  const qrPayload = `${missionId}|${role || 'SENDER'}`;

  const handleShareMission = async () => {
    try {
      const message = `SkyPal Mission Link\nID: ${missionId}\n\nPaste this ID in the app to link the landing zone.`;
      await Clipboard.setStringAsync(missionId as string);
      await Share.share({ message });
    } catch (error) {
      Alert.alert("Error", "Could not open share menu.");
    }
  };

  const handleNextStep = () => {
    // CRITICAL: We pass both missionId and role to MissionStatus
    router.push({
      pathname: '/MissionStatus',
      params: { missionId, role }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.card}>
        <MaterialCommunityIcons 
          name={role === 'RECEIVER' ? "package-variant-closed" : "qrcode-scan"} 
          size={40} 
          color="#00FF7F" 
        />
        <Text style={styles.title}>LATCH ACCESS KEY</Text>
        <Text style={styles.subtitle}>
          {role === 'RECEIVER' 
            ? "Receiver: Show this to the drone to unlock the package" 
            : "Sender: Show this to the drone to start loading"}
        </Text>

        <View style={styles.qrContainer}>
          <QRCode value={qrPayload} size={200} color="black" backgroundColor="white" />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{role || 'SENDER'} VERIFICATION</Text>
          <Text style={styles.idText}>{missionId}</Text>
        </View>

        {role === 'SENDER' && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareMission}>
            <LinearGradient colors={['#00FF7F', '#009688']} style={styles.btnGradient}>
              <MaterialCommunityIcons name="share-variant" size={20} color="white" />
              <Text style={styles.btnText}>SEND ID TO RECEIVER</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
          <Text style={styles.nextText}>
            {role === 'RECEIVER' ? "View Mission Progress 📡" : "View Flight Status 📡"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 30, borderRadius: 25, alignItems: 'center', width: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  qrContainer: { padding: 15, backgroundColor: 'white', borderRadius: 15, marginBottom: 20 },
  infoBox: { alignItems: 'center', marginBottom: 25 },
  infoLabel: { color: '#00FF7F', fontSize: 10, fontWeight: 'bold' },
  idText: { color: 'white', fontFamily: 'monospace', fontSize: 14 },
  shareBtn: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 15 },
  btnGradient: { flexDirection: 'row', paddingVertical: 15, justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  nextBtn: { marginTop: 10, padding: 10 },
  nextText: { color: '#00E5FF', fontWeight: 'bold', fontSize: 16 }
});