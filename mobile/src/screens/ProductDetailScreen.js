import { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import PaymentScreen from './PaymentScreen';

export default function ProductDetailScreen({ product, onBack }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentData, setPaymentData] = useState(null); // { order, razorpayInfo }

  const increase = () => setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decrease = () => setQuantity((q) => Math.max(q - 1, 1));

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const orderRes = await api.post('/orders', { productId: product._id, quantity });
      const order = orderRes.data;
      order.product = product; // attach for display in PaymentScreen

      const paymentRes = await api.post(`/orders/${order._id}/create-payment`);

      setPaymentData({ order, razorpayInfo: paymentRes.data });
    } catch (err) {
      console.log('placeOrder error', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  };

  if (paymentData) {
    return (
      <PaymentScreen
        order={paymentData.order}
        razorpayInfo={paymentData.razorpayInfo}
        user={user}
        onSuccess={() => {
          setPaymentData(null);
          Alert.alert('Payment successful!', 'Your order is confirmed.', [{ text: 'OK', onPress: onBack }]);
        }}
        onCancel={() => {
          setPaymentData(null);
          Alert.alert('Payment cancelled', 'Your order was placed but payment is still pending. You can pay later from My Orders.', [{ text: 'OK', onPress: onBack }]);
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.artisan}>by {product.artisan?.name || 'Unknown'}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.stock}>In stock: {product.stock}</Text>

      <View style={styles.quantityRow}>
        <Text style={styles.label}>Quantity</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperBtn} onPress={decrease}>
            <Text style={styles.stepperText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity style={styles.stepperBtn} onPress={increase}>
            <Text style={styles.stepperText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.total}>Total: ₹{product.price * quantity}</Text>

      <TouchableOpacity style={styles.orderBtn} onPress={placeOrder} disabled={placing}>
        {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderText}>Place Order & Pay</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 55, flexGrow: 1 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#2d6a4f', fontWeight: '600', fontSize: 15 },
  image: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16, backgroundColor: '#eee' },
  imagePlaceholder: {},
  title: { fontSize: 22, fontWeight: 'bold' },
  artisan: { fontSize: 14, color: '#888', marginTop: 2 },
  price: { fontSize: 20, color: '#2d6a4f', fontWeight: 'bold', marginTop: 10 },
  description: { fontSize: 14, color: '#444', marginTop: 12, lineHeight: 20 },
  stock: { fontSize: 13, color: '#888', marginTop: 10 },
  quantityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 24,
  },
  label: { fontSize: 15, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 8 },
  stepperBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  stepperText: { fontSize: 18, fontWeight: '600' },
  quantityValue: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  orderBtn: {
    backgroundColor: '#2d6a4f', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 20,
  },
  orderText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});