import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  // PASTE YOUR NEW KEY HERE
  apiKey: "AIzaSyBet6CAFDnXBvHvTelWuZ14KiDb8HvhWfU", 
  authDomain: "skypal-app-6408.firebaseapp.com",
  projectId: "skypal-app-6408",
  storageBucket: "skypal-app-6408.firebasestorage.app",
  messagingSenderId: "932759010707",
  appId: "1:932759010707:web:3ac4ad9a3746a13b28fc66"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage as any)
});
export const db = getFirestore(app);
console.log("🚀 SkyPal Firebase Check: Connection initialized.");