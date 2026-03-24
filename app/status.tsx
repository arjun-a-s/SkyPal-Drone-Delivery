import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StatusScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams();

  // 1. Live Mission States
  const [status, setStatus] = useState("PENDING");
  const [eta, setEta] = useState<string | null>(null);
  const [battery, setBattery] = useState("100%");

  // 2. Poll the "Takeoff Logic System" every 2 seconds
  useEffect(() => {
    if (!missionId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`http://192.168.31.178:8000/api/status/${missionId}`);
        if (!response.ok) return;

        const data = await response.json();
        setStatus(data.status);

        if (data.status === "APPROVED") {
          setEta(data.eta);
          setBattery(data.battery);
        }
      } catch (error) {
        console.log("Polling error:", error);
      }
    };

    checkStatus(); // Initial check

    const interval = setInterval(() => {
      checkStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [missionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mission Status</Text>
      {missionId && (
        <Text style={styles.missionIdText}>Tracking ID: {missionId}</Text>
      )}

      {/* STATUS CARD */}
      <View style={[styles.card, status === "APPROVED" ? styles.successCard : styles.pendingCard]}>
        <Text style={styles.label}>Current Status</Text>
        <Text style={styles.statusText}>
          {status === "PENDING" ? "Checking Weather..." : "DRONE EN ROUTE"}
        </Text>

        {status === "PENDING" && <ActivityIndicator size="small" color="#555" style={{ marginTop: 10 }} />}
      </View>

      {/* ETA SECTION (Only shows after approval) */}
      {status === "APPROVED" && (
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>ETA</Text>
            <Text style={styles.infoValue}>{eta}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Drone Battery</Text>
            <Text style={styles.infoValue}>{battery}</Text>
          </View>
        </View>
      )}

      {/* MAP PLACEHOLDER */}
      <View style={styles.mapPlaceholder}>
        <Text style={{ color: '#888' }}>Live Drone Map Loading...</Text>
      </View>

      {/* NEXT STEP BUTTON */}
      {status === "APPROVED" && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.buttonText}>I'm Ready to Receive</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  missionIdText: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20, fontFamily: 'monospace' },

  card: { padding: 25, borderRadius: 15, marginBottom: 20, alignItems: 'center', elevation: 3 },
  pendingCard: { backgroundColor: '#fffbe6', borderWidth: 1, borderColor: '#ffe58f' },
  successCard: { backgroundColor: '#e6fffa', borderWidth: 1, borderColor: '#b5f5ec' },

  label: { fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  statusText: { fontSize: 22, fontWeight: 'bold', marginTop: 5, color: '#333' },

  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoBox: { backgroundColor: 'white', width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginTop: 5 },

  mapPlaceholder: { height: 200, backgroundColor: '#e1e4e8', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },

  actionButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});