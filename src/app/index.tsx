import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BuyerDashboard from '../screens/BuyerDashboard';
import ArtisanDashboard from '../screens/ArtisanDashboard';
import AdminDashboard from '../screens/AdminDashboard';

export default function Index() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  switch (user.role) {
    case 'buyer':
      return <BuyerDashboard />;
    case 'artisan':
      return <ArtisanDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <BuyerDashboard />;
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});