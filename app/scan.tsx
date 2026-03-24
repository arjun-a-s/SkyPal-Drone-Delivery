// FILE: app/scan.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState("Scan Drone QR Code");

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: 'white' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permButton}>
            <Text style={styles.permText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    // START SIMULATION
    setStatus("Connecting to Drone WiFi...");
    
    // 1. Fake WiFi Connection Delay
    setTimeout(() => {
        setStatus("Verifying Mission Token...");
        
        // 2. Fake Server Verification Delay
        setTimeout(() => {
            Alert.alert("Authentication Success!", "Package Unlocked. You may pick it up.", [
                { text: "Finish", onPress: () => router.replace('/home') }
            ]);
        }, 2000);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.scanBox}>
            {scanned ? <ActivityIndicator size="large" color="#007AFF" /> : <View style={styles.cornerMarkers} />}
        </View>
        <Text style={styles.statusText}>{status}</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={{color: 'white'}}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  statusText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  cancelBtn: { marginTop: 50, padding: 15, backgroundColor: '#ff4444', borderRadius: 10 },
  permButton: { marginTop: 20, backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
  permText: { color: 'white' }
});