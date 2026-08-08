import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AdminUsers from './AdminUsers';
import ProfileScreen from './ProfileScreen';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await api.get('/products/pending');
      setProducts(res.data);
    } catch (err) {
      console.log('fetchPending error', err.message);
      Alert.alert('Error', 'Could not load pending products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPending();
  }, []);

  const handleDecision = async (id, status) => {
    setActingOn(id);
    try {
      await api.put(`/products/${id}/approve`, { status });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log('approve error', err.message);
      Alert.alert('Error', 'Could not update product status.');
    } finally {
      setActingOn(null);
    }
  };

  if (showUsers) {
    return <AdminUsers onBack={() => setShowUsers(false)} />;
  }

  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, {user.name}</Text>
          <Text style={styles.subtitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={() => setShowUsers(true)}>
        <Text style={styles.actionBtnText}>Manage Users</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2980b9' }]} onPress={() => setShowProfile(true)}>
        <Text style={styles.actionBtnText}>Profile</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Pending Product Approvals</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8e44ad" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No pending products. All caught up!</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>₹{item.price} · {item.category}</Text>
                <Text style={styles.cardMeta}>by {item.artisan?.name || 'Unknown'}</Text>

                {actingOn === item._id ? (
                  <ActivityIndicator size="small" color="#8e44ad" style={{ marginTop: 8 }} />
                ) : (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.approveBtn]}
                      onPress={() => handleDecision(item._id, 'approved')}
                    >
                      <Text style={styles.smallBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.rejectBtn]}
                      onPress={() => handleDecision(item._id, 'rejected')}
                    >
                      <Text style={styles.smallBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55, paddingHorizontal: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#8e44ad', fontWeight: '600', marginTop: 2 },
  logout: { color: '#c0392b', fontWeight: '600' },
  actionBtn: { backgroundColor: '#8e44ad', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  card: {
    flexDirection: 'row', backgroundColor: '#f7f2fa', borderRadius: 10,
    padding: 10, marginBottom: 10, alignItems: 'flex-start',
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  cardImagePlaceholder: {},
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  smallBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  approveBtn: { backgroundColor: '#2d6a4f' },
  rejectBtn: { backgroundColor: '#c0392b' },
  smallBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});