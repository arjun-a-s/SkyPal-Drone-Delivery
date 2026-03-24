import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig'; // Ensure db is exported from your config

export default function OnboardingScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleCompleteProfile = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    Alert.alert("Error", "No active session. Please log in again.");
    router.replace('/login');
    return;
  }

  try {
    // Save data to Firestore first
    await setDoc(doc(db, "pilots", user.uid), {
      firstName,
      lastName,
      phoneNumber: phone,
    });

    // Try sending email
    await sendEmailVerification(user);
    Alert.alert("Success", "Verification email sent! Check your inbox.");
    router.replace('/home');
    
  } catch (error: any) {
    console.log("Detailed Error:", error.code);
    if (error.code === 'auth/invalid-credential') {
      Alert.alert("Session Expired", "Please log out and log back in to verify your email.");
    } else {
      Alert.alert("Error", error.message);
    }
  }
};

  return (
    <LinearGradient colors={['#020024', '#090979', '#00d4ff']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Text style={styles.title}>Pilot Profile</Text>
        <Text style={styles.subtitle}>Complete your offboarding to begin missions</Text>

        <View style={styles.glassCard}>
          <TextInput 
            style={styles.input} 
            placeholder="First Name" 
            placeholderTextColor="#ccc" 
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Last Name" 
            placeholderTextColor="#ccc" 
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Phone Number" 
            keyboardType="phone-pad"
            placeholderTextColor="#ccc" 
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity onPress={handleCompleteProfile}>
            <LinearGradient colors={['#00C6FF', '#0072FF']} style={styles.button}>
              <Text style={styles.buttonText}>Finish & Verify Email</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#A0D8FF', textAlign: 'center', marginBottom: 30 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});