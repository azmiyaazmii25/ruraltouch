import { useEffect } from 'react';
import { View, Text } from 'react-native';
import api from '../api/api';

export default function Index() {
  useEffect(() => {
    api.get('/products')
      .then((res) => console.log('SUCCESS:', res.data))
      .catch((err) => console.log('ERROR:', err.message));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Testing API connection...</Text>
    </View>
  );
}