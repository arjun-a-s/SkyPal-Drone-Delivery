import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function LiveTracking({ missionData }: { missionData: any }) {
  // 1. Coordinates from Firebase
  const droneLoc = {
    latitude: missionData?.currentLat || 8.5241,
    longitude: missionData?.currentLong || 76.9366,
  };

  const receiverLoc = {
    latitude: missionData?.receiverLat || 8.5355,
    longitude: missionData?.receiverLong || 76.9450,
  };

  // 2. Real-time Calculations
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance(droneLoc.latitude, droneLoc.longitude, receiverLoc.latitude, receiverLoc.longitude);
  const eta = Math.ceil(distance / 0.5); // 30km/h speed

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          region={{
            ...droneLoc,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }}
        >
          {/* CARTO DB VOYAGER TILES - NO API KEY NEEDED */}
          <UrlTile
  urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
  {...({ 
    subdomains: ['a', 'b', 'c', 'd'],
    tileSize: 256 
  } as any)}
  maximumZ={20}
/>

          <Marker coordinate={droneLoc} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.droneMarkerContainer}>
              <MaterialCommunityIcons name="drone" size={30} color="#00FF7F" />
            </View>
          </Marker>

          <Marker coordinate={receiverLoc}>
            <MaterialCommunityIcons name="map-marker-check" size={35} color="#FF4B2B" />
          </Marker>

          <Polyline
            coordinates={[droneLoc, receiverLoc]}
            strokeColor="#00E5FF"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      </View>

      {/* INFO SHEET */}
      <View style={styles.infoSheet}>
        <View style={styles.handle} />
        <Text style={styles.etaTitle}>
          {distance < 0.03 ? "Arriving Now" : `Arriving in ${eta} mins`}
        </Text>
        <Text style={styles.statusText}>SkyPal Mission: {missionData?.id?.substring(0, 6)}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Altitude</Text>
            <Text style={styles.statValue}>{missionData?.altitude || '15'}m</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapWrapper: { height: height * 0.6, width: width },
  map: { ...StyleSheet.absoluteFillObject },
  infoSheet: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, marginTop: -30, elevation: 20 },
  handle: { width: 40, height: 5, backgroundColor: '#E0E0E0', alignSelf: 'center', borderRadius: 3, marginBottom: 15 },
  etaTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  statusText: { fontSize: 14, color: '#7F8C8D', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#95A5A6', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
  droneMarkerContainer: { backgroundColor: 'rgba(0, 255, 127, 0.15)', padding: 8, borderRadius: 40, borderWidth: 2, borderColor: '#00FF7F' }
});