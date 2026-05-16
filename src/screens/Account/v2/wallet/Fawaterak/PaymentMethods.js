import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../../../shared/AppHeader';
import AppText from '../../../../../shared/AppText';
import AppButton from '../../../../../component/AppButton';

import {
  FAWATERK_Prefix,
  FAWATERK_TOKEN,
} from '../../../../../utils/app';

const PaymentMethodsScreen = ({route, navigation}) => {
  const {t} = useTranslation();

  const {item_name, item_price, item_id, pay_type} = route.params || {};

  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://${FAWATERK_Prefix}.fawaterk.com/api/v2/getPaymentmethods`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${FAWATERK_TOKEN}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawMethods = Array.isArray(data?.data) ? data.data : [];

      const grouped = buildGroupedMethods(rawMethods);
      setMethods(grouped);

      if (grouped.length > 0) {
        setSelectedMethod(grouped[0]);
      }
    } catch (error) {
      console.log('PAYMENT METHODS ERROR:', error);
      Alert.alert(
        t('common.error'),
        t('payment.methods_load_failed'),
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizeText = value => String(value || '').toLowerCase();

  const pickGroup = method => {
    const ar = normalizeText(method?.name_ar);
    const en = normalizeText(method?.name_en);
    const text = `${ar} ${en}`;

    if (
      text.includes('visa') ||
      text.includes('master') ||
      text.includes('card') ||
      text.includes('بطاقة')
    ) {
      return 'cards';
    }

    if (text.includes('fawry') || ar.includes('فوري')) {
      return 'fawry';
    }

    if (text.includes('aman') || ar.includes('أمان') || ar.includes('امان')) {
      return 'aman';
    }

    if (text.includes('basata') || ar.includes('بساطة')) {
      return 'basata';
    }

    if (
      text.includes('wallet') ||
      text.includes('vodafone') ||
      text.includes('orange') ||
      text.includes('etisalat') ||
      text.includes('we') ||
      ar.includes('محفظ') ||
      ar.includes('فودافون') ||
      ar.includes('اورنج') ||
      ar.includes('اتصالات')
    ) {
      return 'wallets';
    }

    return 'other';
  };

  const buildGroupedMethods = rawMethods => {
    const groups = {
      cards: [],
      fawry: [],
      aman: [],
      basata: [],
      wallets: [],
      other: [],
    };

    rawMethods.forEach(method => {
      const key = pickGroup(method);
      groups[key].push(method);
    });

    const result = [];

    if (groups.cards.length > 0) {
      result.push({
        id: 'cards',
        type: 'cards',
        title: t('payment.cards'),
        items: groups.cards,
      });
    }

    if (groups.fawry.length > 0) {
      result.push({
        id: 'fawry',
        type: 'fawry',
        title: t('payment.fawry'),
        items: groups.fawry,
      });
    }

    if (groups.aman.length > 0) {
      result.push({
        id: 'aman',
        type: 'aman',
        title: t('payment.aman'),
        items: groups.aman,
      });
    }

    if (groups.basata.length > 0) {
      result.push({
        id: 'basata',
        type: 'basata',
        title: t('payment.basata'),
        items: groups.basata,
      });
    }

    if (groups.wallets.length > 0) {
      result.push({
        id: 'wallets',
        type: 'wallets',
        title: t('payment.e_wallets'),
        items: groups.wallets,
      });
    }

    if (groups.other.length > 0) {
      groups.other.forEach(method => {
        result.push({
          id: `other-${method.paymentId}`,
          type: 'single',
          title: method.name_ar || method.name_en,
          items: [method],
        });
      });
    }

    return result;
  };

  const handleConfirm = () => {
    if (!selectedMethod) {
      return;
    }

    setConfirmLoading(true);

    try {
      const firstItem = selectedMethod.items?.[0];

      if (!firstItem) {
        setConfirmLoading(false);
        return;
      }

      if (selectedMethod.type === 'wallets') {
        navigation.navigate('PhoneWalletScreen', {
          paymentId: firstItem.paymentId,
          paymentName: selectedMethod.title,
          item_id,
          item_price,
          item_name,
          pay_type,
          methods: selectedMethod.items,
        });
      } else {
        navigation.navigate('PayRedirectScreen', {
          logo: firstItem.logo,
          paymentId: firstItem.paymentId,
          paymentName: selectedMethod.title,
          item_id,
          item_price,
          item_name,
          pay_type,
          methods: selectedMethod.items,
        });
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const renderGroupLogos = group => {
    const items = group?.items || [];

    if (group.type === 'cards') {
      return (
        <View style={styles.logosRow}>
          {items.slice(0, 3).map(item => (
            <Image
              key={String(item.paymentId)}
              source={{uri: item.logo}}
              style={styles.cardLogo}
              resizeMode="contain"
            />
          ))}
        </View>
      );
    }

    if (group.type === 'wallets') {
      return (
        <View style={styles.logosRow}>
          {items.slice(0, 4).map(item => (
            <Image
              key={String(item.paymentId)}
              source={{uri: item.logo}}
              style={styles.walletLogo}
              resizeMode="contain"
            />
          ))}
        </View>
      );
    }

    const firstItem = items[0];

    return firstItem ? (
      <Image
        source={{uri: firstItem.logo}}
        style={styles.singleLogo}
        resizeMode="contain"
      />
    ) : null;
  };

  const renderMethodItem = group => {
    const isSelected = selectedMethod?.id === group.id;

    return (
      <TouchableOpacity
        key={group.id}
        activeOpacity={0.85}
        style={[
          styles.methodCard,
          isSelected && styles.methodCardSelected,
        ]}
        onPress={() => setSelectedMethod(group)}>

        <View style={styles.methodRight}>
             <View
            style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
            ]}>
            {isSelected ? <View style={styles.radioInner} /> : null}
          </View>
          <AppText weight="medium" style={styles.methodTitle}>
            {group.title}
          </AppText>

         
        </View>


        <View style={styles.methodLeft}>
          {renderGroupLogos(group)}
        </View>

       
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="payment.methods_title"
          onBack={() => navigation.goBack()}
        />

        <AppText style={styles.subtitle}>
          {t('payment.choose_method')}
        </AppText>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {methods.map(renderMethodItem)}
            </ScrollView>

            <View style={styles.bottomButtonWrap}>
              <AppButton
                title={confirmLoading ? '' : t('payment.confirm')}
                onPress={handleConfirm}
                disabled={!selectedMethod || confirmLoading}>
                {confirmLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : null}
              </AppButton>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#8B8B8B',
    textAlign: 'auto',
    marginTop: 10,
    marginBottom: 16,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  methodCard: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    backgroundColor: '#F7F7F7',
    marginBottom: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodCardSelected: {
    borderColor: '#4AA5E6',
    backgroundColor: '#FAFDFF',
  },

  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 15,
    color: '#1F1F1F',
    marginStart: 10,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B9B9B9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#4AA5E6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4AA5E6',
  },

  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: {
    width: 32,
    height: 20,
    marginStart: 8,
  },
  singleLogo: {
    width: 40,
    height: 22,
  },
  walletLogo: {
    width: 28,
    height: 20,
    marginStart: 8,
  },

  bottomButtonWrap: {
    position: 'absolute',
    paddingHorizontal:25,
    left: 0,
    right: 0,
    bottom: 18,
    backgroundColor: 'transparent',
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});