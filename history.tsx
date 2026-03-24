// FILE: app/history.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Fake Data for the Demo
const MOCK_HISTORY = [
  { id: '1', date: 'Jan 18, 2026', from: 'College Canteen', to: 'Hostel Block A', status: 'Delivered', price: '₹45' },
  { id: '2', date: 'Jan 15, 2026', from: 'Library', to: 'Main Gate', status: 'Delivered', price: '₹20' },
  { id: '3', date: 'Jan 12, 2026', from: 'Lab Complex', to: 'Admin Block', status: 'Cancelled', price: '₹0' },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={[styles.status, item.status === 'Cancelled' ? styles.red : styles.green]}>
          {item.status}
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>FROM</Text>
          <Text style={styles.value}>{item.from}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.label}>TO</Text>
          <Text style={styles.value}>{item.to}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Past Deliveries</Text>
      </View>

      <FlatList 
        data={MOCK_HISTORY}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backBtn: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, color: '#333' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  
  date: { fontSize: 14, color: '#888', fontWeight: '600' },
  status: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  green: { backgroundColor: '#e6fffa', color: '#00b894' },
  red: { backgroundColor: '#ffe6e6', color: '#ff7675' },
  
  label: { fontSize: 10, color: '#aaa', fontWeight: 'bold', letterSpacing: 1 },
  value: { fontSize: 16, color: '#333', fontWeight: '500', marginTop: 2 },
});