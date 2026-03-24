// FILE: app/index.tsx (The New Animation Screen)
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import DroneLogo from '../DroneLogo'; // Your custom logo file

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  // Animation Value: Drone starts OFF-SCREEN at the bottom
  const droneY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // START ANIMATION
    Animated.timing(droneY, {
      toValue: -200, // Fly OFF-SCREEN to the top
      duration: 3000, // Takes 3 seconds to fly across
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth acceleration
    }).start(() => {
      // WHEN DONE: Switch to the Welcome Screen
      router.replace('/welcome'); 
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Same Background Gradient so it blends perfectly */}
      <LinearGradient
        colors={['#020024', '#090979', '#00d4ff']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <Animated.View 
          style={{
            transform: [{ translateY: droneY }], // Bind position to animation
            alignItems: 'center'
          }}
        >
          {/* Your Custom Drone Logo */}
          <DroneLogo width={180} height={180} /> 
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020024' },
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});