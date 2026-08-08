import { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import api from '../api/api';

export default function ProductDetailScreen({ product, onBack, onOrdered }) {
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);

  const total = product.price * quantity;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/orders', { productId: product._id, quantity });
      Alert.alert('Order placed', `Order for ${quantity} x ${product.title} placed.`);
      onOrdered();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.artisan}>by {product.artisan?.name || 'Unknown'}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <Text style={styles.stock}>{product.stock} in stock</Text>

      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>Total: ₹{total}</Text>

      <TouchableOpacity style={styles.orderBtn} onPress={placeOrder} disabled={placing}>
        {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>Place Order</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 55, backgroundColor: '#fff' },
  back: { color: '#2d6a4f', fontWeight: '600', marginBottom: 12 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16, backgroundColor: '#eee' },
  imagePlaceholder: {},
  title: { fontSize: 22, fontWeight: 'bold' },
  artisan: { fontSize: 14, color: '#888', marginTop: 2 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#2d6a4f', marginTop: 8 },
  desc: { fontSize: 14, color: '#444', marginTop: 10, lineHeight: 20 },
  stock: { fontSize: 12, color: '#999', marginTop: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  qtyBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f2f2f2', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold' },
  qtyValue: { fontSize: 16, fontWeight: '600', marginHorizontal: 16 },
  total: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  orderBtn: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  orderBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});