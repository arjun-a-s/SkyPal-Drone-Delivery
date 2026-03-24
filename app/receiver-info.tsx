import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReceiverInfoScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams();

  const handleAccept = () => {
    // IMPORTANT: We pass the existing missionId AND the RECEIVER role
    // This tells the CameraScreen to UPDATE the doc instead of creating a new one.
    router.push({
      pathname: '/CameraScreen',
      params: { 
        missionId: missionId,
        role: 'RECEIVER' 
      }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.modalContent}>
        <Text style={styles.header}>Receiver Briefing</Text>
        <Text style={styles.missionTag}>Linked to Mission: {missionId}</Text>
        
        <ScrollView style={styles.scrollArea}>
          <Text style={styles.infoText}>
            You are linking your location as the secure landing zone for a SkyPal delivery. {"\n\n"}
            • Ensure you are in a clear, 3m x 3m open space.{"\n"}
            • Maintain line-of-sight with the sky.{"\n"}
            • Your geotagged photo will confirm the landing coordinates for the Raspberry Pi flight controller.{"\n\n"}
            <Text style={{fontWeight: 'bold', color: '#00E5FF'}}>
              The drone will not launch until your coordinates are verified.
            </Text>
          </Text>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => router.replace('/')}>
            <Text style={styles.btnText}>Exit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.btnText}>Accept & Geotag</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    width: '90%', 
    height: '60%', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 30, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(0, 229, 255, 0.3)',
    justifyContent: 'center'
  },
  header: { fontSize: 24, color: '#00E5FF', fontWeight: 'bold', textAlign: 'center' },
  missionTag: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', marginBottom: 20, fontFamily: 'monospace' },
  scrollArea: { marginBottom: 20 },
  infoText: { color: 'white', fontSize: 16, lineHeight: 24 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  acceptBtn: { backgroundColor: '#00E5FF', padding: 15, borderRadius: 12, flex: 0.65, alignItems: 'center' },
  rejectBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 12, flex: 0.3, alignItems: 'center' },
  btnText: { fontWeight: 'bold', color: '#020024' }
});