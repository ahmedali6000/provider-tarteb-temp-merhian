import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useTranslation} from 'react-i18next';

import AppText from '../../../../shared/AppText';
import AppHeader from '../../../../shared/AppHeader';
import {
  initOrderPayment,
  confirmOrderCardPayment,
} from '../../../../services/paymentService';

const COLORS = {
  main: '#3296D9',
  mainSoft: '#EEF8FF',
  text: '#111111',
  muted: '#8A8A8A',
  white: '#FFFFFF',
  danger: '#E53935',
};

const SUCCESS_URL = 'https://tarteb.app/succ';
const FAIL_URL = 'https://tarteb.app/fail';
const PENDING_URL = 'https://tarteb.app/pending';

const OrderCardPaymentWebViewScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const orderId = route?.params?.order_id;
  const paymentMethodId = route?.params?.payment_method_id || 2;
  const methodKey = route?.params?.method_key || 'card';

  const [loadingInit, setLoadingInit] = useState(true);
  const [webLoading, setWebLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handledRef = useRef(false);

  useEffect(() => {
    initPayment();
  }, []);

  const initPayment = async () => {
    if (!orderId) {
      setErrorMessage(
        t('payment_webview.missing_order', {
          defaultValue: 'رقم الطلب غير متوفر',
        }),
      );
      setLoadingInit(false);
      return;
    }

    try {
      setLoadingInit(true);
      setErrorMessage(null);

      const response = await initOrderPayment({
        orderId,
        paymentMethodId,
        methodKey,
      });

      if (!response?.status) {
        setErrorMessage(
          response?.message ||
            t('payment_webview.init_failed', {
              defaultValue: 'تعذر تجهيز صفحة الدفع',
            }),
        );
        return;
      }

      const redirectUrl =
        response?.redirect_url ||
        response?.data?.redirect_url ||
        response?.data?.payment_url;

      const returnedInvoiceId =
        response?.invoice_id || response?.data?.invoice_id;

      if (!redirectUrl) {
        setErrorMessage(
          t('payment_webview.no_payment_url', {
            defaultValue: 'رابط الدفع غير متوفر',
          }),
        );
        return;
      }

      setPaymentUrl(redirectUrl);
      setInvoiceId(returnedInvoiceId);
    } catch (error) {
      console.log(
        'INIT CARD PAYMENT ERROR:',
        error?.response?.data || error?.message,
      );

      setErrorMessage(
        error?.response?.data?.message ||
          t('payment_webview.init_failed', {
            defaultValue: 'تعذر تجهيز صفحة الدفع',
          }),
      );
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSuccess = async () => {
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;

    try {
      setConfirming(true);

      const response = await confirmOrderCardPayment({
        orderId,
        invoiceId,
      });

      if (response?.status) {
        navigation.replace('OrderFullDetailsScreen', {
          order_id: orderId,
        });

        return;
      }

      Alert.alert(
        t('payment_webview.error_title', {
          defaultValue: 'حدث خطأ',
        }),
        response?.message ||
          t('payment_webview.confirm_failed', {
            defaultValue: 'تم الدفع ولكن تعذر تأكيد العملية',
          }),
      );
    } catch (error) {
      console.log(
        'CONFIRM CARD PAYMENT ERROR:',
        error?.response?.data || error?.message,
      );

      Alert.alert(
        t('payment_webview.error_title', {
          defaultValue: 'حدث خطأ',
        }),
        error?.response?.data?.message ||
          t('payment_webview.confirm_failed', {
            defaultValue: 'تم الدفع ولكن تعذر تأكيد العملية',
          }),
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleFail = () => {
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;

    navigation.replace('OrderFullDetailsScreen', {
      order_id: orderId,
      payment_status: 'failed',
    });
  };

  const handleNavigationChange = navState => {
    const url = navState?.url || '';

    if (url.includes(SUCCESS_URL)) {
      handleSuccess();
      return;
    }

    if (url.includes(FAIL_URL)) {
      handleFail();
      return;
    }

    if (url.includes(PENDING_URL)) {
      navigation.replace('OrderFullDetailsScreen', {
        order_id: orderId,
        payment_status: 'pending',
      });
    }
  };

  const renderLoading = message => (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color={COLORS.main} />

      <AppText weight="bold" style={styles.loadingTitle}>
        {message}
      </AppText>

      <AppText style={styles.loadingSubtitle}>
        {t('payment_webview.wait_message', {
          defaultValue: 'برجاء الانتظار وعدم إغلاق التطبيق',
        })}
      </AppText>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerBox}>
      <View style={styles.errorCircle}>
        <AppText weight="bold" style={styles.errorMark}>
          !
        </AppText>
      </View>

      <AppText weight="bold" style={styles.errorTitle}>
        {t('payment_webview.error_title', {
          defaultValue: 'حدث خطأ',
        })}
      </AppText>

      <AppText style={styles.errorText}>
        {errorMessage}
      </AppText>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.retryButton}
        onPress={initPayment}>
        <AppText weight="bold" style={styles.retryText}>
          {t('payment_webview.retry', {
            defaultValue: 'إعادة المحاولة',
          })}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppHeader
          title={t('payment_webview.title', {
            defaultValue: 'الدفع بكارت البنك',
          })}
          onBack={() => navigation.goBack()}
        />

        {loadingInit
          ? renderLoading(
              t('payment_webview.preparing', {
                defaultValue: 'جاري تجهيز شاشة الدفع...',
              }),
            )
          : errorMessage
            ? renderError()
            : (
              <View style={styles.webViewWrap}>
                {webLoading ? (
                  <View style={styles.webLoaderOverlay}>
                    {renderLoading(
                      t('payment_webview.loading_page', {
                        defaultValue: 'جاري فتح صفحة الدفع...',
                      }),
                    )}
                  </View>
                ) : null}

                {confirming ? (
                  <View style={styles.webLoaderOverlay}>
                    {renderLoading(
                      t('payment_webview.confirming', {
                        defaultValue: 'جاري تأكيد الدفع...',
                      }),
                    )}
                  </View>
                ) : null}

                <WebView
                  source={{uri: paymentUrl}}
                  onLoadEnd={() => {
                    setTimeout(() => {
                      setWebLoading(false);
                    }, 700);
                  }}
                  onNavigationStateChange={handleNavigationChange}
                  startInLoadingState
                  javaScriptEnabled
                  domStorageEnabled
                  sharedCookiesEnabled
                  thirdPartyCookiesEnabled
                  originWhitelist={['*']}
                />
              </View>
            )}
      </View>
    </SafeAreaView>
  );
};

export default OrderCardPaymentWebViewScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  webViewWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: COLORS.white,
  },

  webLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: COLORS.white,
  },

  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  loadingTitle: {
    fontSize: 15,
    color: COLORS.main,
    marginTop: 16,
    textAlign: 'center',
  },

  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },

  errorCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FEECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorMark: {
    fontSize: 28,
    color: COLORS.danger,
  },

  errorTitle: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 18,
  },

  retryButton: {
    minWidth: 140,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  retryText: {
    fontSize: 14,
    color: COLORS.white,
  },
});