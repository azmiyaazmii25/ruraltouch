import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState(null); // product id currently being approved/rejected

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
      // Remove it from the pending list immediately (optimistic UI update)
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log('approve error', err.message);
      Alert.alert('Error', 'Could not update product status.');
    } finally {
      setActingOn(null);
    }
  };

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
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleDecision(item._id, 'approved')}
                    >
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleDecision(item._id, 'rejected')}
                    >
                      <Text style={styles.actionText}>Reject</Text>
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
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333' },
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
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  approveBtn: { backgroundColor: '#2d6a4f' },
  rejectBtn: { backgroundColor: '#c0392b' },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});