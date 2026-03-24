import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MissionComplete() {
  const router = useRouter();
  const { missionId, role } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000046', '#1CB5E0']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.successCard}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="package-variant" size={60} color="#00FF7F" />
          <MaterialCommunityIcons 
            name="check-decagram" 
            size={30} 
            color="white" 
            style={styles.checkBadge} 
          />
        </View>

        <Text style={styles.title}>MISSION ACCOMPLISHED</Text>
        <Text style={styles.subtitle}>
          {role === 'SENDER' 
            ? "Your package has been successfully delivered and collected." 
            : "Package received! The latch has been secured."}
        </Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailLabel}>MISSION ID</Text>
          <Text style={styles.detailValue}>{missionId}</Text>
        </View>

        <TouchableOpacity 
          style={styles.homeBtn} 
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeBtnText}>Return to Hangar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  successCard: { 
    width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 30, 
    padding: 30, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  iconContainer: { marginBottom: 20, position: 'relative' },
  checkBadge: { position: 'absolute', bottom: -5, right: -5 },
  title: { color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  detailsBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 15, width: '100%', alignItems: 'center', marginBottom: 30 },
  detailLabel: { color: '#00E5FF', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  detailValue: { color: 'white', fontFamily: 'monospace', fontSize: 12 },
  homeBtn: { backgroundColor: '#00FF7F', paddingVertical: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
  homeBtnText: { color: '#020024', fontWeight: 'bold', fontSize: 16 }
});