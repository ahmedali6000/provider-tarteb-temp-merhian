import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppText from '../../../../shared/AppText';

const COLORS = {
  main: '#3296D9',
  text: '#111111',
  muted: '#8A8A8A',
  white: '#FFFFFF',
};

const OrderQrCodeScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const orderId = route?.params?.order_id;

  const qrValue = JSON.stringify({
    type: 'order_price_adjustment',
    order_id: orderId,
  });

  const handleDone = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {flexDirection: isRTL ? 'row' : 'row-reverse'},
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <AppText weight="bold" style={styles.headerTitle}>
            {t('order_qr.title', {defaultValue: 'تعديل السعر'})}
          </AppText>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.qrWrapper}>
          {orderId ? (
            <QRCode
              value={qrValue}
              size={210}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          ) : (
            <AppText style={styles.errorText}>
              {t('order_qr.missing_order', {
                defaultValue: 'رقم الطلب غير متوفر',
              })}
            </AppText>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.doneButton}
          onPress={handleDone}>
          <AppText weight="bold" style={styles.doneButtonText}>
            {t('order_qr.done', {defaultValue: 'تم مسح الرمز'})}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderQrCodeScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.text,
  },
  headerSpace: {
    width: 36,
  },
  qrWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 70,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
  },
  doneButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  doneButtonText: {
    fontSize: 15,
    color: COLORS.white,
  },
});