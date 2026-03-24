// FILE: app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Requires: npx expo install expo-linear-gradient
import { StatusBar } from 'expo-status-bar'; // Requires: npx expo install expo-status-bar
import { useRouter } from 'expo-router';

// Import your custom Logo component
import DroneLogo from '../DroneLogo'; 

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Main Background Gradient */}
      <LinearGradient
        colors={['#020024', '#090979', '#00d4ff']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.content}>
          
          {/* 1. YOUR DRONE LOGO (SVG Code) */}
          <View style={{ marginBottom: 30 }}>
            <DroneLogo width={120} height={120} />
          </View>

          {/* Title Section */}
          <Text style={styles.titleText}>Welcome to</Text>
          <Text style={styles.appNameText}>SkyPal</Text>
          <Text style={styles.taglineText}>Your Autonomous Delivery Partner</Text>

          {/* "Get Started" Button */}
          <TouchableOpacity 
            onPress={() => router.push('/login')} 
            style={styles.buttonContainer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00C6FF', '#0072FF']} 
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* 2. YOUR BOTTOM IMAGE */}
        {/* IMPORTANT: Make sure the file in assets/images is named EXACTLY 'delivery-bottom.png' */}
        <Image 
          source={require('../../assets/images/delivery-bottom.png')} 
          style={styles.bottomImage}
          resizeMode="cover"
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: 'space-between' },
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 30, 
    paddingTop: 50, 
    zIndex: 1 
  },
  titleText: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    textAlign: 'center' 
  },
  appNameText: {
    fontSize: 48, 
    fontWeight: '800', 
    color: '#00C6FF', 
    textAlign: 'center', 
    marginBottom: 10,
    textShadowColor: 'rgba(0, 198, 255, 0.5)', 
    textShadowOffset: { width: 0, height: 0 }, 
    textShadowRadius: 10,
  },
  taglineText: { 
    fontSize: 18, 
    color: '#E0E0E0', 
    textAlign: 'center', 
    marginBottom: 50,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    width: '100%', 
    borderRadius: 30, 
    overflow: 'hidden', 
    elevation: 8,
    shadowColor: '#00C6FF', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 8,
  },
  buttonGradient: { 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
  bottomImage: { 
    width: width, 
    height: width * 0.8, 
    position: 'absolute', 
    bottom: 0, 
    zIndex: 0 
  },
});