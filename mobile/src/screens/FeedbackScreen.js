import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import api from '../api/api';

export default function FeedbackScreen({ order, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please tap a star to rate this product.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/feedback', { orderId: order._id, rating, comment });
      Alert.alert('Thank you!', 'Your feedback was submitted.', [{ text: 'OK', onPress: onDone }]);
    } catch (err) {
      console.log('feedback submit error', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onDone} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Cancel'}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Rate {order.product?.title || 'this product'}</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Write a comment (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Feedback</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55, paddingHorizontal: 20, backgroundColor: '#fff' },
  backBtn: { marginBottom: 16 },
  backText: { color: '#2d6a4f', fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  stars: { flexDirection: 'row', marginBottom: 20 },
  star: { fontSize: 40, color: '#ddd', marginRight: 8 },
  starActive: { color: '#f1c40f' },
  input: {
    backgroundColor: '#f2f2f2', borderRadius: 10, padding: 14,
    minHeight: 90, fontSize: 15, marginBottom: 20, textAlignVertical: 'top',
  },
  submitBtn: { backgroundColor: '#2d6a4f', padding: 16, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});