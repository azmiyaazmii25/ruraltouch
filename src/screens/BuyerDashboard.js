import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import ProductDetailScreen from './ProductDetailScreen';
import BuyerOrders from './BuyerOrders';
import ProfileScreen from './ProfileScreen';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'craft', label: 'Craft' },
  { key: 'mehendi', label: 'Mehendi' },
  { key: 'tailoring', label: 'Tailoring' },
  { key: 'makeup', label: 'Makeup' },
];

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load products. Check your connection.');
      console.log('fetchProducts error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  if (showOrders) {
    return <BuyerOrders onBack={() => setShowOrders(false)} />;
  }

  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  const filtered = products.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedProduct(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={{ color: '#999' }}>No image</Text>
        </View>
      )}
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardPrice}>₹{item.price}</Text>
      <Text style={styles.cardArtisan} numberOfLines={1}>by {item.artisan?.name || 'Unknown'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowProfile(true)} style={{ marginRight: 16 }}>
            <Text style={styles.myOrders}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOrders(true)} style={{ marginRight: 16 }}>
            <Text style={styles.myOrders}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, category === item.key && styles.categoryChipActive]}
            onPress={() => setCategory(item.key)}
          >
            <Text style={[styles.categoryText, category === item.key && styles.categoryTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2d6a4f" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={renderProduct}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No products found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55, paddingHorizontal: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  myOrders: { color: '#2d6a4f', fontWeight: '600' },
  logout: { color: '#c0392b', fontWeight: '600' },
  search: {
    backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, marginBottom: 12, fontSize: 15,
  },
  categoryList: { flexGrow: 0, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f2f2f2', marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#2d6a4f' },
  categoryText: { color: '#333', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  grid: { paddingBottom: 40 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#fafafa', borderRadius: 12,
    padding: 10, maxWidth: '47%',
  },
  cardImage: { width: '100%', height: 110, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  cardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardPrice: { fontSize: 14, color: '#2d6a4f', fontWeight: 'bold', marginTop: 2 },
  cardArtisan: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});