import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = { buyer: '#2d6a4f', artisan: '#e67e22', admin: '#8e44ad' };

export default function ProfileScreen({ onBack }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] }]}>
        <Text style={styles.roleText}>{user.role}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Member since</Text>
        <Text style={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55, paddingHorizontal: 24, backgroundColor: '#fff', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backText: { color: '#2d6a4f', fontWeight: '600' },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#2d6a4f',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#888', marginTop: 4 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  roleText: { color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  divider: { width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#333', fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#c0392b', paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: 10, marginTop: 30,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});