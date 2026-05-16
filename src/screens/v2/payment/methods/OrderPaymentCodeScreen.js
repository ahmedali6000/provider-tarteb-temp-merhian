import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  I18nManager,
} from 'react-native';
import {SvgUri} from 'react-native-svg';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppText from '../../../../shared/AppText';
import AppHeader from '../../../../shared/AppHeader';
import {isSvg} from '../../../../utils/HelperFunctions';
import {initOrderPayment} from '../../../../services/paymentService';

const COLORS = {
  main: '#3498DB',
  text: '#111111',
  subText: '#8D8D8D',
  lightText: '#A7A7A7',
  white: '#FFFFFF',
  border: '#E7E7E7',
  overlay: 'rgba(0,0,0,0.55)',
  danger: '#E74C3C',
};

const PaymentLogo = ({url}) => {
  if (!url) {
    return <View style={styles.logoPlaceholder} />;
  }

  if (isSvg(url)) {
    return (
      <View style={styles.logoBox}>
        <SvgUri uri={url} width="100%" height="100%" />
      </View>
    );
  }

  return (
    <Image
      source={{uri: url}}
      style={styles.logoImage}
      resizeMode="contain"
    />
  );
};

const OrderPaymentCodeScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const orderId = route?.params?.order_id;
  const paymentMethodId = route?.params?.payment_method_id;
  const methodKey = route?.params?.method_key;
  const methodLogo = route?.params?.method_logo;

  const [loading, setLoading] = useState(true);
  const [paymentCode, setPaymentCode] = useState('');
  const [invoiceId, setInvoiceId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);

  const requestedRef = useRef(false);

  useEffect(() => {
    preparePaymentCode();
  }, []);

  const preparePaymentCode = async () => {
    if (requestedRef.current) {
      return;
    }

    requestedRef.current = true;

    if (!orderId || !paymentMethodId || !methodKey) {
      setErrorMessage(
        t('payment_code.missing_data', {
          defaultValue: 'بيانات الدفع غير مكتملة',
        }),
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await initOrderPayment({
        orderId,
        paymentMethodId,
        methodKey,
      });

      if (!response?.status) {
        setErrorMessage(
          response?.message ||
            t('payment_code.failed_prepare', {
              defaultValue: 'تعذر تجهيز كود الدفع',
            }),
        );
        return;
      }

      const code =
        response?.code ||
        response?.ref_num ||
        response?.data?.code ||
        response?.data?.ref_num ||
        '';

      const returnedInvoiceId =
        response?.invoice_id || response?.data?.invoice_id || null;

      if (!code) {
        setErrorMessage(
          t('payment_code.no_code', {
            defaultValue: 'كود الدفع غير متوفر',
          }),
        );
        return;
      }

      setPaymentCode(String(code));
      setInvoiceId(returnedInvoiceId);
    } catch (error) {
      console.log(
        'ORDER PAYMENT CODE ERROR:',
        error?.response?.data || error?.message,
      );

      setErrorMessage(
        error?.response?.data?.message ||
          t('payment_code.failed_prepare', {
            defaultValue: 'تعذر تجهيز كود الدفع',
          }),
      );
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    requestedRef.current = false;
    preparePaymentCode();
  };

  const handleDone = () => {
    navigation.replace('OrderFullDetailsScreen', {
      order_id: orderId,
      invoice_id: invoiceId,
      payment_status: 'pending_code',
    });
  };

  const renderStep = (number, text) => (
    <View
      style={[
        styles.stepRow,
        {flexDirection: isRTL ? 'row' : 'row-reverse'},
      ]}>
      <View style={styles.stepCircle}>
        <AppText weight="bold" style={styles.stepNumber}>
          {number}
        </AppText>
      </View>

      <AppText style={styles.stepText}>{text}</AppText>
    </View>
  );

  const renderBottomSheet = () => (
    <Modal
      visible={infoVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setInfoVisible(false)}>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setInfoVisible(false)}>
        <Pressable style={styles.sheetContainer} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <AppText weight="bold" style={styles.sheetTitle}>
            {t('payment_code.how_title', {
              defaultValue: 'كيف تتم عملية الدفع؟',
            })}
          </AppText>

          <View style={styles.stepsContainer}>
            {renderStep(
              1,
              t('payment_code.step_1', {
                defaultValue: 'توجه إلى أقرب منفذ دفع مثل فوري أو أمان.',
              }),
            )}

            {renderStep(
              2,
              t('payment_code.step_2', {
                defaultValue: 'اطلب من الموظف استخدام خدمة الدفع بالكود.',
              }),
            )}

            {renderStep(
              3,
              t('payment_code.step_3', {
                defaultValue: 'أخبره بكود الدفع الظاهر في التطبيق.',
              }),
            )}

            {renderStep(
              4,
              t('payment_code.step_4', {
                defaultValue:
                  'بعد إتمام الدفع، يتم التحقق من العملية وتحديث الطلب.',
              }),
            )}
          </View>

          <View
            style={[
              styles.sheetFooterRow,
              {flexDirection: isRTL ? 'row' : 'row-reverse'},
            ]}>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={COLORS.main}
            />
            <AppText style={styles.sheetFooterText}>
              {t('payment_code.sheet_note', {
                defaultValue:
                  'لا تستغرق عملية الدفع عادة أكثر من بضع دقائق.',
              })}
            </AppText>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderLoading = () => (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={COLORS.main} />
      <AppText weight="bold" style={styles.loadingTitle}>
        {t('payment_code.preparing', {
          defaultValue: 'جاري تجهيز كود الدفع...',
        })}
      </AppText>
      <AppText style={styles.loadingText}>
        {t('payment_code.wait', {
          defaultValue: 'برجاء الانتظار قليلًا',
        })}
      </AppText>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerState}>
      <View style={styles.errorCircle}>
        <Ionicons name="alert-outline" size={28} color={COLORS.danger} />
      </View>

      <AppText weight="bold" style={styles.errorTitle}>
        {t('payment_code.error_title', {
          defaultValue: 'حدث خطأ',
        })}
      </AppText>

      <AppText style={styles.errorText}>{errorMessage}</AppText>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.retryButton}
        onPress={retry}>
        <AppText weight="bold" style={styles.retryButtonText}>
          {t('payment_code.retry', {
            defaultValue: 'إعادة المحاولة',
          })}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setInfoVisible(true)}
        style={[
          styles.howRow,
          {flexDirection: isRTL ? 'row' : 'row-reverse'},
        ]}>
        <Ionicons name="bulb-outline" size={14} color={COLORS.main} />
        <AppText weight="medium" style={styles.howRowText}>
          {t('payment_code.how_link', {
            defaultValue: 'كيف تتم عملية الدفع؟',
          })}
        </AppText>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <PaymentLogo url={methodLogo} />
      </View>

      <AppText style={styles.description}>
        {t('payment_code.description', {
          defaultValue:
            'ادفع قيمة الطلب من خلال أحد منافذ الدفع باستخدام الكود التالي.',
        })}
      </AppText>

      <AppText weight="bold" style={styles.codeText}>
        {paymentCode}
      </AppText>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.doneButton}
        onPress={handleDone}>
        <AppText weight="bold" style={styles.doneButtonText}>
          {t('payment_code.done', {
            defaultValue: 'تم الدفع',
          })}
        </AppText>
      </TouchableOpacity>

      <AppText style={styles.noteText}>
        {t('payment_code.note', {
          defaultValue: 'بعد الضغط سيتم التحقق من عملية الدفع.',
        })}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={t('payment_code.title', {
            defaultValue: 'إتمام الدفع',
          })}
          onBack={() => navigation.goBack()}
        />

        {loading
          ? renderLoading()
          : errorMessage
          ? renderError()
          : renderContent()}

        {renderBottomSheet()}
      </View>
    </SafeAreaView>
  );
};

export default OrderPaymentCodeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingHorizontal:10
  },

  howRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -2,
    marginBottom: 34,
  },

  howRowText: {
    fontSize: 14,
    color: COLORS.main,
    marginHorizontal: 4,
     
  },

  logoWrapper: {
    width: 160,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  logoBox: {
    width: 160,
   
  },

  logoImage: {
    width: 150,
    height: 68,
  },

  logoPlaceholder: {
    width: 110,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
  },

  description: {
    width: 320,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    marginBottom: 34,
  },

  codeText: {
    fontSize: 28,
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 40,
  },

  doneButton: {
    width: '90%',
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  doneButtonText: {
    fontSize: 15,
    color: COLORS.white,
  },

  noteText: {
    fontSize: 12,
    color: COLORS.lightText,
    textAlign: 'center',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },

  loadingTitle: {
    fontSize: 15,
    color: COLORS.main,
    marginTop: 14,
    textAlign: 'center',
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 8,
    textAlign: 'center',
  },

  errorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 8,
  },

  errorText: {
    fontSize: 13.5,
    color: COLORS.subText,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
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

  retryButtonText: {
    fontSize: 14,
    color: COLORS.white,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },

  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopStartRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
  },

  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 16,
  },

  sheetTitle: {
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 18,
  },

  stepsContainer: {
    marginBottom: 18,
  },

  stepRow: {
    alignItems: 'center',
    marginBottom: 15,
  },

  stepCircle: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1,
    borderColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },

  stepNumber: {
    fontSize: 11,
    color: COLORS.main,
  },

  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'auto',
  },

  sheetFooterRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetFooterText: {
    fontSize: 11.5,
    color: COLORS.subText,
    marginHorizontal: 5,
    textAlign: 'center',
  },
});