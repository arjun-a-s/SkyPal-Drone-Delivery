import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      {/* Change "HomeScreen" or "home" to "index" */}
      <Stack.Screen name="index" /> 

      <Stack.Screen name="sender-info" />
      <Stack.Screen name="receiver-info" />
      <Stack.Screen name="MissionStatus" />

      <Stack.Screen 
        name="MissionQR" 
        options={{ 
          presentation: 'transparentModal',
          gestureEnabled: false, 
          animation: 'slide_from_bottom'
        }} 
      />

      <Stack.Screen name="login" />
    </Stack>
  );
}