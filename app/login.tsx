import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DroneLogo from './DroneLogo';

// FIREBASE IMPORTS
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail // Added for password recovery
  ,


  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // NEW: Password Reset Logic
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address in the field above first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Reset Sent", "Check your inbox (and spam) for the password reset link.");
    } catch (error: any) {
      Alert.alert("Reset Error", error.message);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      if (isRegistering) {
        // 1. Create the account
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Pilot account created!");
        
        // 2. Redirect NEW pilots to Onboarding
        router.replace('/onboarding'); 
      } else {
        // 3. Existing pilots go straight to Home
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/home');
      }
    } catch (error: any) {
      Alert.alert("Auth Error", error.message);
      console.log("Firebase Auth Error:", error.code);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={styles.background}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <DroneLogo width={80} height={80} />
            <Text style={styles.title}>SkyPal Access</Text>
            <Text style={styles.subtitle}>Pilot {isRegistering ? 'Registration' : 'Login'}</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="pilot@skypal.com"
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* NEW: Forgot Password Link (Only shows during Login) */}
            {!isRegistering && (
              <TouchableOpacity 
                onPress={handleForgotPassword} 
                style={styles.forgotPasswordWrapper}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleAuth} style={styles.mainButton}>
              <LinearGradient colors={['#00C6FF', '#0072FF']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isRegistering ? 'Register Pilot' : 'Verify & Launch'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsRegistering(!isRegistering)} 
              style={styles.linkWrapper}
            >
              <Text style={styles.linkText}>
                {isRegistering ? 'Already have an account? Login' : 'New Pilot? Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, padding: 20 },
  keyboardView: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#A0D8FF', marginTop: 5, letterSpacing: 1 },
  glassCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    padding: 30, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)' 
  },
  label: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#E0E0E0', 
    textTransform: 'uppercase' 
  },
  input: { 
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    padding: 15, 
    borderRadius: 12, 
    fontSize: 18, 
    color: 'white', 
    marginBottom: 10 
  },
  forgotPasswordWrapper: { 
    alignSelf: 'flex-end', 
    marginBottom: 20 
  },
  forgotPasswordText: { 
    color: '#A0D8FF', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  mainButton: { 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  buttonGradient: { 
    padding: 16, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  linkWrapper: { 
    marginTop: 20 
  },
  linkText: { 
    color: '#00C6FF', 
    textAlign: 'center', 
    fontWeight: '600' 
  },
});