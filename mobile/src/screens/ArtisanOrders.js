import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import api from '../api/api';

const STATUS_COLORS = { placed: '#e67e22', shipped: '#2980b9', delivered: '#2d6a4f', cancelled: '#c0392b' };
const NEXT_ACTIONS = {
  placed: [{ label: 'Mark Shipped', status: 'shipped' }, { label: 'Cancel', status: 'cancelled' }],
  shipped: [{ label: 'Mark Delivered', status: 'delivered' }],
  delivered: [],
  cancelled: [],
};

export default function ArtisanOrders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOn, setActingOn] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/received');
      setOrders(res.data);
    } catch (err) {
      console.log('fetchOrders error', err.message);
      Alert.alert('Error', 'Could not load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setActingOn(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      console.log('updateStatus error', err.message);
      Alert.alert('Error', 'Could not update order.');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back to Dashboard'}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Orders Received</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e67e22" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.product?.imageUrl ? (
                <Image source={{ uri: item.product.imageUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.product?.title || 'Product'}</Text>
                <Text style={styles.cardMeta}>Qty: {item.quantity} · ₹{item.totalAmount}</Text>
                <Text style={styles.cardMeta}>Buyer: {item.buyer?.name || 'Unknown'}</Text>

                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>

                {actingOn === item._id ? (
                  <ActivityIndicator size="small" color="#e67e22" style={{ marginTop: 8 }} />
                ) : (
                  <View style={styles.actionRow}>
                    {NEXT_ACTIONS[item.status].map((action) => (
                      <TouchableOpacity
                        key={action.status}
                        style={styles.actionBtn}
                        onPress={() => updateStatus(item._id, action.status)}
                      >
                        <Text style={styles.actionText}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
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
  backBtn: { marginBottom: 10 },
  backText: { color: '#e67e22', fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  card: {
    flexDirection: 'row', backgroundColor: '#faf5f0', borderRadius: 10,
    padding: 10, marginBottom: 10,
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  cardImagePlaceholder: {},
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionBtn: { backgroundColor: '#e67e22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});