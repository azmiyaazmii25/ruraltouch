import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import api from '../api/api';

export default function PaymentScreen({ order, razorpayInfo, user, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(true);

  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          var options = {
            key: "${razorpayInfo.keyId}",
            amount: "${razorpayInfo.amount}",
            currency: "${razorpayInfo.currency}",
            order_id: "${razorpayInfo.razorpayOrderId}",
            name: "RuralTouch",
            description: "${order.product?.title || 'Order Payment'}",
            prefill: { name: "${user.name}", email: "${user.email}" },
            theme: { color: "#2d6a4f" },
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: "success",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }));
            },
            modal: {
              ondismiss: function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: "cancelled" }));
              }
            }
          };
          var rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ status: "failed" }));
          });
          rzp.open();
        </script>
      </body>
    </html>
  `;

  const handleMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.status === 'cancelled' || data.status === 'failed') {
      onCancel();
      return;
    }

    if (data.status === 'success') {
      try {
        await api.post(`/orders/${order._id}/verify-payment`, {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        });
        onSuccess();
      } catch (err) {
        console.log('verify-payment error', err.response?.data || err.message);
        Alert.alert('Payment issue', 'Payment succeeded but verification failed. Contact support.');
        onCancel();
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#2d6a4f" />
        </View>
      )}
      <WebView
        source={{ html: checkoutHtml }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        setSupportMultipleWindows={false}
        javaScriptCanOpenWindowsAutomatically={true}
      />
      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', zIndex: 1,
  },
  cancelBtn: { padding: 14, alignItems: 'center', backgroundColor: '#f2f2f2' },
  cancelText: { color: '#c0392b', fontWeight: '600' },
});