import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

const CATEGORIES = ['craft', 'mehendi', 'tailoring', 'makeup', 'other'];

export default function EditProductScreen({ product, onDone }) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [category, setCategory] = useState(product.category);
  const [image, setImage] = useState(null); // only set if user picks a new one
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !price) {
      Alert.alert('Missing fields', 'Title, description, and price are required.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = product.imageUrl;

      if (image) {
        const formData = new FormData();
        const filename = image.uri.split('/').pop();
        const ext = filename.split('.').pop();
        formData.append('image', {
          uri: image.uri,
          name: filename,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });
        const uploadRes = await api.post('/products/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await api.put(`/products/${product._id}`, {
        title, description, price: Number(price), stock: Number(stock), category, imageUrl,
      });

      Alert.alert('Updated', 'Product updated and resubmitted for approval.');
      onDone();
    } catch (err) {
      console.log('edit product error', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Could not update product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete product', `Delete "${product.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await api.delete(`/products/${product._id}`);
            Alert.alert('Deleted', 'Product removed.');
            onDone();
          } catch (err) {
            console.log('delete product error', err.response?.data || err.message);
            Alert.alert('Error', 'Could not delete product.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Product</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>Tap to select a photo</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Price (₹)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock quantity"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Changes</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={submitting}>
        <Text style={styles.deleteText}>Delete Product</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={onDone}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 55, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  imagePicker: {
    height: 160, borderRadius: 12, backgroundColor: '#f2f2f2',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
  },
  imagePickerText: { color: '#888' },
  previewImage: { width: '100%', height: '100%' },
  input: {
    backgroundColor: '#f2f2f2', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 10, marginBottom: 12, fontSize: 15,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f2f2f2', marginRight: 8, marginBottom: 8,
  },
  categoryChipActive: { backgroundColor: '#e67e22' },
  categoryText: { color: '#333', fontSize: 13 },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#e67e22', padding: 14, borderRadius: 10,
    alignItems: 'center', marginBottom: 10,
  },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    backgroundColor: '#c0392b', padding: 14, borderRadius: 10,
    alignItems: 'center', marginBottom: 10,
  },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelText: { color: '#888' },
});