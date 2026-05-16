  import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
  import React from 'react'
  import { WebView } from 'react-native-webview';
  import { backgroundColorHady, btnColor, domain, FAWATERK_Prefix, FAWATERK_TOKEN, FAWATERK_URK_TESTING, secondColor, succesColor } from '../../utils/app';
  import { ActivityIndicator, Button } from 'react-native-paper';
  import { useSelector } from 'react-redux';
  import { useTranslation } from 'react-i18next';
  import axios from 'axios';
  import RNRestart from 'react-native-restart';
import HeaderApp from '../../shared/Header';

export default function PayRedirectScreen({ route, navigation }) {
  const tokenK = useSelector(state => state.auth.token); 
  const codeStr = {
    3 : 'fawryCode',
    12: 'amanCode',
    14 : 'masaryCode',
    2 : 'VisaMaster',
    4 : 'MobileWallets'
  };

  const { t } = useTranslation();
  const [codeOTP, setCodeOTP] = React.useState(null);
  const { item_name, item_price, item_id, paymentId, paymentName, logo, pay_type } = route.params;
  const [showWebView, setShowWebView] = React.useState(false);
  const [serverPaid, setServerPaid] = React.useState(false);
  const [webViewFinished, setWebViewFinished] = React.useState(false);
  const [paymentUrl, setPaymentUrl] = React.useState('');
  const user = useSelector(state => state.auth.user);

  const hasRequested = React.useRef(false);
  const invoiceIdRef = React.useRef(null);

  const days = useSelector(state => state.order.bundle_days);
  const hour = useSelector(state => state.order.bundle_hour);
  const bundle_id = useSelector(state => state.order.bundle_id);

  const API_TOKEN = FAWATERK_TOKEN;
  const PAYMENT_id = paymentId;

  const requestData = {
    payment_method_id: PAYMENT_id,
    cartTotal: item_price,
    currency: 'EGP',
    customer: {
      first_name: user?.name || 'test',
      last_name: 'tarteb',
      email: 'test@test.test',
      phone: user?.phone || '01000000000',
      address: user?.address || 'test address',
    },
    redirectionUrls: {
      successUrl: 'https://tarteb.app/succ',
      failUrl: 'https://tarteb.app/fail',
      pendingUrl: 'https://tarteb.app/pending',
    },
    cartItems: [
      {
        name: '#' + item_id,
        price: item_price,
        quantity: '1',
      },
    ],
  };

  const handlePayment = () => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    };

    fetch(`https://${FAWATERK_Prefix}.fawaterk.com/api/v2/invoiceInitPay`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data.data) return;

        if (paymentId === 2) {
          setPaymentUrl(data.data.payment_data.redirectTo);
          setShowWebView(true);
        }

        const refNum = data.data.payment_data[codeStr[paymentId]];
        const invoice_id = data.data.invoice_id;
        invoiceIdRef.current = invoice_id;

        const generateRefData = {
          order_id: item_id,
          ref_num: refNum,
          method: codeStr[paymentId],
          amount: item_price,
          paytype: (item_id < 1000) ? 'bundle' : 'order',
          invoice_id,
        };

        if (item_id < 1000) {
          generateRefData.bundle_data = {
            days,
            hour,
            bundle_id,
          };
        }

        axios({
          method: 'post',
          url: domain + '/api/generateRef',
          headers: {
            Authorization: `Bearer ${tokenK}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: generateRefData,
        }).then(() => {
          setCodeOTP(refNum);
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  React.useEffect(() => {
    handlePayment();
  }, []);

  const handleNavigationChange = (navState) => {
    if (navState.url.includes('https://tarteb.app/succ')) {
      if (!serverPaid) {
        setServerPaid(true);
        axios({
          method: 'post',
          url: domain + '/api/pay-order-fawaterak',
          headers: {
            Authorization: `Bearer ${tokenK}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          data: {
            order_id: item_id,
            invoice_id: invoiceIdRef.current,
          },
        }).then(() => {
          setShowWebView(false);
          navigation.navigate('ResponseScreen', {
            status: true,
            item_id,
            item_price,
            item_name: '#' + item_id,
            pay_type,
          });
        });
      }
    } else if (navState.url.includes('https://tarteb.app/fail')) {
      setShowWebView(false);
      navigation.navigate('ResponseScreen', {
        status: false,
        item_id,
        item_price,
        item_name: '#' + item_id,
        pay_type,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderApp title='Payment step' />
      {(paymentId === 2) ? (
        <View style={{ flex: 1, backgroundColor: backgroundColorHady }}>
          {!webViewFinished && (
            <View style={{
              flex: 1, alignItems: 'center', justifyContent: 'center',
              position: 'absolute', height: '100%', width: '100%', zIndex: 999999
            }}>
              <ActivityIndicator style={{ marginBottom: 20 }} size='large' color={btnColor} />
              <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 15, color: btnColor }}>جاري تجهيز شاشة الدفع ..</Text>
            </View>
          )}
          <View style={{
            flex: 1,
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: webViewFinished ? 9999 : 0,
          }}>
            <WebView
              source={{ uri: paymentUrl }}
              onLoadEnd={() => {
                setTimeout(() => {
                  setWebViewFinished(true);
                }, 2200);
              }}
              onNavigationStateChange={handleNavigationChange}
            />
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Image source={{ uri: logo }} style={{ width: 200, height: 100, resizeMode: 'contain' }} />
          </View>

          {codeOTP ? (
            <Text style={styles.title}> {codeOTP} </Text>
          ) : (
            <ActivityIndicator style={{ marginBottom: 20 }} size='large' color={btnColor} />
          )}

          <Text style={styles.description}>
            {t('payment.code_des')}
          </Text>

          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: succesColor }]} onPress={() => RNRestart.Restart()}>
            <Text style={styles.cancelButtonText}>{t('payment.payCodeN')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      padding: 10,
    },
    closeButtonText: {
      fontSize: 20,
      color: '#000',
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    icon: {
      fontSize: 70,
    
    },
    title: {
      fontFamily:'Tajawal-Bold',
      fontSize: 22,
      
      marginBottom: 10,
    },
    description: {
      fontFamily:'Tajawal-Medium',
      fontSize: 16,
      textAlign: 'center',
      color: '#555',
      marginBottom: 20,
      lineHeight: 26,
    },
    cancelButton: {
      backgroundColor: '#d32f2f',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 5,
    },
    cancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily:'Tajawal-Bold',
    },
  })