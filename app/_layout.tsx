// app/_layout.js (or wherever your RootLayout is)
import Auth from "@/components/Auth";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Main App Content Component
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show Auth screen if user is not logged in
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Auth />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show main app (tabs) if user is logged in
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Root Layout with Auth Provider
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});