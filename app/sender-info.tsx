import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SenderInfoScreen() {
  const router = useRouter();

  const handleAccept = () => {
    // IMPORTANT: We pass the 'role' as SENDER here.
    // This ensures that after the camera takes the photo, 
    // the app knows to generate the Sender-specific QR code.
    router.push({
      pathname: '/CameraScreen',
      params: { role: 'SENDER' } 
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.modalContent}>
        <Text style={styles.header}>Sender Mission Briefing</Text>
        
        <ScrollView style={styles.scrollArea}>
          <Text style={styles.infoText}>
            SkyPal requires a precise visual lock to coordinate your drone delivery. {"\n\n"}
            • Select a flat, open area for the drone.{"\n"}
            • Avoid trees or overhead power lines.{"\n"}
            • The photo will automatically embed your GPS Latitude and Longitude.{"\n\n"}
            <Text style={{fontWeight: 'bold', color: '#00FF7F'}}>
              Step 1: Capture your location.{"\n"}
              Step 2: Share the Mission ID with the receiver.
            </Text>
            {"\n\n"}
            This data is encrypted and used only for the duration of this flight mission.
          </Text>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => router.back()}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.btnText}>Accept & Open Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: '88%', 
    height: '60%', // Slightly increased height for better text fit
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 30, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center'
  },
  header: { fontSize: 24, color: '#00E5FF', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  scrollArea: { marginBottom: 20 },
  infoText: { color: 'white', fontSize: 16, lineHeight: 24, textAlign: 'left' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  acceptBtn: { backgroundColor: '#00FF7F', padding: 15, borderRadius: 12, flex: 0.65, alignItems: 'center' },
  rejectBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 12, flex: 0.3, alignItems: 'center' },
  btnText: { fontWeight: 'bold', color: '#020024' } // Darker text for better contrast on green button
});