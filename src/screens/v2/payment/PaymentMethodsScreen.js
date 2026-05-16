import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
  Alert,
} from 'react-native';


import {useDispatch, useSelector} from 'react-redux';
import {UPDATE_CREDIT} from '../../../redux/actions/ActionTypes';
import {finishOrderCash} from '../../../services/paymentService';


import {useTranslation} from 'react-i18next';
import CashIcon from '../../../../assets/app/svgs/moneys.svg';
import WalletIcon from '../../../../assets/app/svgs/cards.svg';
import AppText from '../../../shared/AppText';
import AppHeader from '../../../shared/AppHeader';

const COLORS = {
  main: '#3296D9',
  mainSoft: '#EEF8FF',
  text: '#111111',
  muted: '#8A8A8A',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const PaymentMethodsScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const [selectedMethod, setSelectedMethod] = useState('cash');

const user = useSelector(state => state.auth.user);

  const dispatch = useDispatch();
  const [submittingCash, setSubmittingCash] = useState(false);

  const orderId = route?.params?.order_id;
  const amount = route?.params?.amount;


  /*
    العربي حسب الصورة:
    الراديو شمال - النص - الصورة يمين
  */
  const methodRowDirection = isRTL ? 'row' : 'row-reverse';

  const methods = [
    {
      id: 'cash',
      title: t('payment_methods.cash', {
        defaultValue: 'تم الدفع كاش',
      }),
      Icon: CashIcon,
    },
    {
      id: 'wallet',
      title: t('payment_methods.wallet', {
        defaultValue: 'بنك ومحافظ إلكترونية',
      }),
       Icon: WalletIcon,
    },
  ];

const onConfirm = async () => {
  if (selectedMethod === 'cash') {
    if (!orderId) {
      Alert.alert(
        t('common.error', {defaultValue: 'حدث خطأ'}),
        t('payment_methods.missing_order', {
          defaultValue: 'رقم الطلب غير متوفر',
        }),
      );
      return;
    }

    try {
      setSubmittingCash(true);

      const response = await finishOrderCash({
        orderId,
      });

      if (response?.status) {
        if (response?.wallet !== undefined) {
          dispatch({
            type: UPDATE_CREDIT,
            payload: response.wallet,
          });
        }

        navigation.replace('OrderFullDetailsScreen', {
          order_id: orderId,
          show_rating: true,
        });

        return;
      }

      Alert.alert(
        t('common.error', {defaultValue: 'حدث خطأ'}),
        response?.message ||
          t('payment_methods.cash_failed', {
            defaultValue: 'تعذر إنهاء الطلب كاش',
          }),
      );
    } catch (error) {
      console.log(
        'FINISH CASH ORDER ERROR:',
        error?.response?.data || error?.message,
      );

      Alert.alert(
        t('common.error', {defaultValue: 'حدث خطأ'}),
        error?.response?.data?.message ||
          t('payment_methods.cash_failed', {
            defaultValue: 'تعذر إنهاء الطلب كاش',
          }),
      );
    } finally {
      setSubmittingCash(false);
    }

    return;
  }

  navigation.navigate('OrderPaymentChannelsScreen', {
    order_id: orderId,
    amount,
    payment_for: 'order',
  });
};

  const renderRadio = active => (
    <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
      {active ? <View style={styles.radioInner} /> : null}
    </View>
  );

  const renderMethod = method => {
    const active = selectedMethod === method.id;
    if(user?.paymentAva == 0 && method.id == 'wallet'){
      return null;
    } 
 
    return (
      <TouchableOpacity
        key={method.id}
        activeOpacity={0.85}
        style={[
          styles.methodCard,
          active && styles.methodCardActive,
          {flexDirection: methodRowDirection},
        ]}
        onPress={() => setSelectedMethod(method.id)}>
           <method.Icon
              width={24}
              height={24}
              
            />
      

        <View
          style={[
            styles.methodTextWrap,
            {alignItems: isRTL ? 'flex-start' : 'flex-end'},
          ]}>
          <AppText
            weight={active ? 'bold' : 'regular'}
            style={styles.methodTitle}
            numberOfLines={1}>
            {method.title}
          </AppText>
        </View>
        {renderRadio(active)}
       
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppHeader
          title={t('payment_methods.title', {
            defaultValue: 'طرق الدفع',
          })}
          onBack={() => navigation.goBack()}
        />

        <AppText
          style={[
            styles.subtitle,
            {textAlign: isRTL ? 'right' : 'left'},
          ]}>
          {t('payment_methods.subtitle', {
            defaultValue: 'اختر وسيلة الدفع المناسبة',
          })}
        </AppText>

        <View style={styles.methodsWrap}>
          {methods.map(renderMethod)}
        </View>

       <TouchableOpacity
          activeOpacity={submittingCash ? 1 : 0.9}
          disabled={submittingCash}
          style={[
            styles.confirmButton,
            submittingCash && {opacity: 0.7},
          ]}
          onPress={onConfirm}>
          {submittingCash ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AppText weight="bold" style={styles.confirmText}>
              {t('payment_methods.confirm', {
                defaultValue: 'تأكيد',
              })}
            </AppText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentMethodsScreen;

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
    height: 57,
    paddingVertical:16,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingHorizontal: 16,
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

  methodTextWrap: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  methodTitle: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    textAlign:'auto'
  },

  methodImage: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
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

  confirmText: {
    fontSize: 15,
    color: COLORS.white,
  },
});