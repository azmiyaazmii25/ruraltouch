import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AddProductScreen from './AddProductScreen';
import EditProductScreen from './EditProductScreen';
import ArtisanOrders from './ArtisanOrders';
import ProfileScreen from './ProfileScreen';

const STATUS_COLORS = { pending: '#e67e22', approved: '#2d6a4f', rejected: '#c0392b' };

export default function ArtisanDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const fetchMyProducts = async () => {
    try {
      const res = await api.get('/products/mine');
      setProducts(res.data);
    } catch (err) {
      console.log('fetchMyProducts error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyProducts();
  }, []);

  if (showAddProduct) {
    return (
      <AddProductScreen
        onDone={() => {
          setShowAddProduct(false);
          fetchMyProducts();
        }}
      />
    );
  }

  if (editingProduct) {
    return (
      <EditProductScreen
        product={editingProduct}
        onDone={() => {
          setEditingProduct(null);
          fetchMyProducts();
        }}
      />
    );
  }

  if (showOrders) {
    return <ArtisanOrders onBack={() => setShowOrders(false)} />;
  }

  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, {user.name}</Text>
          <Text style={styles.subtitle}>Artisan Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddProduct(true)}>
        <Text style={styles.addBtnText}>+ Add Product</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: '#2980b9' }]}
        onPress={() => setShowOrders(true)}
      >
        <Text style={styles.addBtnText}>View Orders Received</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: '#8e44ad' }]}
        onPress={() => setShowProfile(true)}
      >
        <Text style={styles.addBtnText}>Profile</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>My Products (tap to edit)</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e67e22" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No products yet. Add your first one!</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setEditingProduct(item)}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  subtitle: { fontSize: 13, color: '#e67e22', fontWeight: '600', marginTop: 2 },
  logout: { color: '#c0392b', fontWeight: '600' },
  addBtn: { backgroundColor: '#e67e22', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10, color: '#333', marginTop: 6 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  card: {
    flexDirection: 'row', backgroundColor: '#faf5f0', borderRadius: 10,
    padding: 10, marginBottom: 10, alignItems: 'center',
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  cardImagePlaceholder: {},
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardPrice: { fontSize: 14, color: '#555', marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});