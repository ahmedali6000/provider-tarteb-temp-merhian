import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
  Image,
} from 'react-native';

import {SvgUri} from 'react-native-svg';
import {isSvg} from '../../../utils/HelperFunctions';
import {useTranslation} from 'react-i18next';

import AppText from '../../../shared/AppText';
import AppHeader from '../../../shared/AppHeader';
import {getPaymentMethods} from '../../../services/paymentService';

const COLORS = {
  main: '#3296D9',
  mainSoft: '#EEF8FF',
  text: '#111111',
  muted: '#8A8A8A',
  border: '#E5E7EB',
  white: '#FFFFFF',
};


const PaymentLogo = ({url}) => {
  if (!url) {
    return <View style={styles.logoFallback} />;
  }

  if (isSvg(url)) {
    return (
      <View style={styles.svgLogoBox}>
        <SvgUri uri={url} width="100%" height="100%" />
      </View>
    );
  }

  return (
    <Image
      source={{uri: url}}
      style={styles.methodLogo}
      resizeMode="contain"
    />
  );
};

const OrderPaymentChannelsScreen = ({navigation, route}) => {
  const {t, i18n} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const orderId = route?.params?.order_id;
  const amount = route?.params?.amount;

  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  /*
   * العربي حسب الصورة:
   * الراديو شمال - النص - اللوجو يمين
   */
  const rowDirection = isRTL ? 'row' : 'row-reverse';

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);

      const response = await getPaymentMethods();
      const list = response?.data || [];

      setMethods(list);

      if (list.length > 0) {
        setSelectedMethod(list[0]);
      }
    } catch (error) {
      console.log(
        'PAYMENT METHODS ERROR:',
        error?.response?.data || error?.message,
      );
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

const onConfirm = () => {
  if (!selectedMethod) {
    return;
  }

 const params = {
  order_id: orderId,
  amount,
  payment_for: 'order',
  payment_method_id: selectedMethod.payment_id,
  method_key: selectedMethod.key,
  method_name: selectedMethod.name,
  method_logo: selectedMethod.logo,
  payment_type: selectedMethod.type,
};

  if (selectedMethod.type === 'redirect') {
    navigation.navigate('OrderCardPaymentWebViewScreen', params);
    return;
  }

  if (selectedMethod.type === 'phone') {
    navigation.navigate('OrderPhoneWalletScreen', params);
    return;
  }

  if (selectedMethod.type === 'code') {
    navigation.navigate('OrderPaymentCodeScreen', params);
    return;
  }
};

  const renderRadio = active => {
    return (
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
    );
  };

  const getMethodTitle = method => {
    if (i18n.language === 'ar') {
      return method?.name_ar || method?.name || '';
    }

    return method?.name_en || method?.name || '';
  };

  const renderMethod = method => {
    const active = selectedMethod?.payment_id === method.payment_id;

    return (
      <TouchableOpacity
        key={String(method.payment_id)}
        activeOpacity={0.86}
        style={[
          styles.methodCard,
          active && styles.methodCardActive,
          {flexDirection: rowDirection},
        ]}
        onPress={() => setSelectedMethod(method)}>
         {renderRadio(active)}
        
        <View
          style={[
            styles.methodTitleWrap,
            {alignItems: isRTL ? 'flex-start' : 'flex-end'},
          ]}>
          <AppText
            weight={active ? 'bold' : 'regular'}
            style={styles.methodTitle}
            numberOfLines={1}>
            {getMethodTitle(method)}
          </AppText>
        </View>
       <View style={styles.logoBox}>
        <PaymentLogo url={method?.logo} />
        </View>
       
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.main} />

          <AppText style={styles.loaderText}>
            {t('payment_channels.loading', {
              defaultValue: 'جاري تحميل طرق الدفع...',
            })}
          </AppText>
        </View>
      );
    }

    if (!methods.length) {
      return (
        <View style={styles.loaderWrap}>
          <AppText style={styles.emptyText}>
            {t('payment_channels.empty', {
              defaultValue: 'لا توجد طرق دفع متاحة حاليًا',
            })}
          </AppText>
        </View>
      );
    }

    return <View style={styles.methodsWrap}>{methods.map(renderMethod)}</View>;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppHeader
          title={t('payment_channels.title', {
            defaultValue: 'طرق الدفع',
          })}
          onBack={() => navigation.goBack()}
        />

        <AppText
          style={[
            styles.subtitle,
            {textAlign:  'auto'},
          ]}>
          {t('payment_channels.subtitle', {
            defaultValue: 'اختر وسيلة الدفع المناسبة',
          })}
        </AppText>

        {renderContent()}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.confirmButton,
            (!selectedMethod || loading) && styles.confirmButtonDisabled,
          ]}
          disabled={!selectedMethod || loading}
          onPress={onConfirm}>
          <AppText weight="bold" style={styles.confirmText}>
            {t('payment_channels.confirm', {
              defaultValue: 'تأكيد',
            })}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderPaymentChannelsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: -2,
    marginBottom: 26,
    paddingHorizontal: 2,
  },

  methodsWrap: {
    width: '100%',
  },

  methodCard: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  methodCardActive: {
    borderColor: COLORS.main,
    backgroundColor: COLORS.mainSoft,
    borderWidth: 1.5,
    shadowColor: COLORS.main,
    shadowOpacity: 0.16,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#BFC6CE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterActive: {
    borderColor: COLORS.main,
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.main,
  },

  methodTitleWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  methodTitle: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    textAlign:'auto'
  },

logoBox: {
  minWidth: 60,
  alignItems: 'flex-end',
  justifyContent: 'center',
},

methodLogo: {
  width: 58,
  height: 30,
},

svgLogoBox: {
  width: 58,
  height: 30,
  alignItems: 'center',
  justifyContent: 'center',
},

logoFallback: {
  width: 42,
  height: 26,
  borderRadius: 13,
  backgroundColor: '#F2F2F2',
},

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },

  loaderText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 10,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },

  confirmButton: {
    height: 52,
    borderRadius: 13,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 22,
  },

  confirmButtonDisabled: {
    opacity: 0.55,
  },

  confirmText: {
    fontSize: 15,
    color: COLORS.white,
  },
});