import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../api/api';
import FeedbackScreen from './FeedbackScreen';

const STATUS_COLORS = { placed: '#e67e22', shipped: '#2980b9', delivered: '#2d6a4f', cancelled: '#c0392b' };

export default function BuyerOrders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/mine');
      setOrders(res.data);
    } catch (err) {
      console.log('fetchOrders error', err.message);
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

  if (feedbackOrder) {
    return (
      <FeedbackScreen
        order={feedbackOrder}
        onDone={() => {
          setReviewedIds((prev) => [...prev, feedbackOrder._id]);
          setFeedbackOrder(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2d6a4f" style={{ marginTop: 30 }} />
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
                <Text style={styles.cardMeta}>Artisan: {item.artisan?.name || 'Unknown'}</Text>

                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>

                {item.status === 'delivered' && !reviewedIds.includes(item._id) && (
                  <TouchableOpacity style={styles.feedbackBtn} onPress={() => setFeedbackOrder(item)}>
                    <Text style={styles.feedbackText}>Leave Feedback</Text>
                  </TouchableOpacity>
                )}
                {reviewedIds.includes(item._id) && (
                  <Text style={styles.reviewedText}>✓ Reviewed</Text>
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
  backText: { color: '#2d6a4f', fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  card: {
    flexDirection: 'row', backgroundColor: '#f4f9f6', borderRadius: 10,
    padding: 10, marginBottom: 10,
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  cardImagePlaceholder: {},
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  feedbackBtn: { backgroundColor: '#2d6a4f', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  feedbackText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  reviewedText: { color: '#2d6a4f', fontSize: 12, marginTop: 8, fontWeight: '600' },
});