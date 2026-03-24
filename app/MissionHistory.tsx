import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function MissionHistoryScreen() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const q = query(
          collection(db, "landing_missions"),
          where("pilotId", "==", auth.currentUser?.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMissions(list);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  const renderMission = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.missionItem}
      onPress={() => router.push({
        pathname: '/MissionQR',
        params: { 
          missionId: item.id,
          lat: item.lat.toString(),
          lng: item.lng.toString(),
          timestamp: item.timestamp
        }
      })}
    >
      s<View style={getStatusDotStyle(item.status)} />
      <View style={{ flex: 1 }}>
        <Text style={styles.missionDate}>
          {item.createdAt?.toDate().toLocaleDateString()} • {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.missionCoords}>{Number(item.lat).toFixed(4)}, {Number(item.lng).toFixed(4)}</Text>
      </View>
      <Text style={styles.statusLabel}>{item.status}</Text>
      <MaterialCommunityIcons name="qrcode" size={24} color="#00FF7F" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mission Logs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00FF7F" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={missions}
          renderItem={renderMission}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No missions recorded yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  // We removed statusDot from here to avoid the error
  missionDate: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  missionCoords: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' },
  statusLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginRight: 15, textTransform: 'uppercase' },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 50 }
});

// Create a separate helper for the dot style
const getStatusDotStyle = (status: string) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: status === 'receiver_ready' ? '#00FF7F' : '#FFD700',
  marginRight: 15
});