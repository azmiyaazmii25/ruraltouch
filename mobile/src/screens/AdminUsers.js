import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../api/api';

const ROLE_COLORS = { buyer: '#2d6a4f', artisan: '#e67e22', admin: '#8e44ad' };

export default function AdminUsers({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.log('fetchUsers error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>All Users ({users.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8e44ad" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardEmail}>{item.email}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: ROLE_COLORS[item.role] }]}>
                <Text style={styles.badgeText}>{item.role}</Text>
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
  backText: { color: '#8e44ad', fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f7f2fa', borderRadius: 10, padding: 14, marginBottom: 10,
  },
  cardName: { fontSize: 15, fontWeight: '600' },
  cardEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});