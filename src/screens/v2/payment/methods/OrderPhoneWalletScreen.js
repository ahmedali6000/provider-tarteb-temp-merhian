import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppText from '../../../../shared/AppText';
import AppHeader from '../../../../shared/AppHeader';
import {initOrderWalletPayment} from '../../../../services/paymentService';
import PhoneWallet from '../../../../../assets/app/svgs/phone-wallet.svg';

const COLORS = {
  main: '#3296D9',
  text: '#111111',
  muted: '#8A8A8A',
  lightText: '#A7A7A7',
  border: '#E5E7EB',
  inputBg: '#FAFAFA',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.65)',
  handle: '#D7D7D7',
};

const OrderPhoneWalletScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const orderId = route?.params?.order_id;
  const amount = route?.params?.amount;
  const paymentMethodId = route?.params?.payment_method_id || 4;
  const methodKey = route?.params?.method_key || 'mobile_wallet';

  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentPhone, setSentPhone] = useState('');
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  const rowDirection = isRTL ? 'row' : 'row-reverse';

  const normalizePhone = value => {
    return String(value || '').replace(/[^\d]/g, '');
  };

  const isValidPhone = () => {
    const clean = normalizePhone(phone);
    return clean.length >= 10 && clean.length <= 11;
  };

  const displaySentPhone = () => {
    const clean = normalizePhone(sentPhone);

    if (clean.startsWith('0')) {
      return `+2${clean}`;
    }

    return `+20${clean}`;
  };

  const walletSteps = [
    t('wallet_payment.instructions.step_1', {
      defaultValue: 'اطلب الكود الذي وصلك في الرسالة.',
    }),
    t('wallet_payment.instructions.step_2', {
      defaultValue: 'أدخل الرقم السري للمحفظة لتأكيد العملية.',
    }),
    t('wallet_payment.instructions.step_3', {
      defaultValue: 'سيتم خصم قيمة الطلب من محفظتك.',
    }),
    t('wallet_payment.instructions.step_4', {
      defaultValue: 'بعد الانتهاء، أعد فتح التطبيق.',
    }),
  ];

  const handleSubmit = async () => {
    if (!isValidPhone() || submitting) {
      return;
    }

    try {
      setSubmitting(true);

      const cleanPhone = normalizePhone(phone);

      const response = await initOrderWalletPayment({
        orderId,
        paymentMethodId,
        methodKey,
        phoneWallet: cleanPhone,
      });

      if (response?.status) {
        setSentPhone(cleanPhone);
        setSent(true);
      }
    } catch (error) {
      console.log(
        'INIT WALLET PAYMENT ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = () => {
    navigation.replace('OrderFullDetailsScreen', {
      order_id: orderId,
      payment_status: 'wallet_pending',
    });
  };

  const renderInstructionsSheet = () => (
    <Modal
      visible={instructionsVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setInstructionsVisible(false)}>
      <Pressable
        style={styles.instructionsOverlay}
        onPress={() => setInstructionsVisible(false)}>
        <Pressable style={styles.instructionsSheet} onPress={() => {}}>
          <View style={styles.instructionsHandle} />

          <AppText weight="bold" style={styles.instructionsTitle}>
            {t('wallet_payment.instructions.title', {
              defaultValue: 'كيف تتم عملية الدفع؟',
            })}
          </AppText>

          <View style={styles.instructionsStepsWrap}>
            {walletSteps.map((step, index) => {
              const isLast = index === walletSteps.length - 1;

              return (
                <View
                  key={`wallet-step-${index}`}
                  style={[
                    styles.instructionStepRow,
                    {flexDirection: isRTL ? 'row' : 'row-reverse'},
                  ]}>
                  <View style={styles.instructionNumberWrap}>
                    <View style={styles.instructionNumberCircle}>
                      <AppText weight="bold" style={styles.instructionNumber}>
                        {index + 1}
                      </AppText>
                    </View>

                    {!isLast ? <View style={styles.instructionLine} /> : null}
                  </View>

                  <AppText style={styles.instructionText}>{step}</AppText>
                </View>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderInputScreen = () => (
    <>
      <AppHeader
        title={t('wallet_payment.title', {
          defaultValue: 'الدفع بالمحفظة الإلكترونية',
        })}
        onBack={() => navigation.goBack()}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setInstructionsVisible(true)}
        style={[
          styles.howLink,
          {
            flexDirection: isRTL ? 'row' : 'row-reverse',
            alignSelf: isRTL ? 'flex-start' : 'flex-end',
          },
        ]}>
        <Ionicons name="bulb-outline" size={14} color={COLORS.main} />

        <AppText weight="medium" style={styles.howText}>
          {t('wallet_payment.how', {
            defaultValue: 'كيف تتم عملية الدفع؟',
          })}
        </AppText>
      </TouchableOpacity>

      <View style={styles.formWrap}>
        <AppText
          weight="medium"
          style={[
            styles.label,
            {
              textAlign: 'auto',
            },
          ]}>
          {t('wallet_payment.phone_label', {
            defaultValue: 'رقم الهاتف',
          })}
        </AppText>

        <View style={[styles.phoneInputBox, {flexDirection: rowDirection}]}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="100 000 000"
            placeholderTextColor="#777"
            style={[
              styles.phoneInput,
              {
                textAlign: 'auto',
              },
            ]}
          />

          <View style={[styles.countryBox, {flexDirection: rowDirection}]}>
            <Ionicons name="chevron-down" size={14} color="#777" />

            <AppText style={styles.countryCode}>+20</AppText>

            <AppText style={styles.flag}>🇪🇬</AppText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!isValidPhone() || submitting}
          style={[
            styles.submitBtn,
            (!isValidPhone() || submitting) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}>
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <AppText weight="bold" style={styles.submitText}>
              {t('wallet_payment.send_request', {
                defaultValue: 'إرسال طلب الدفع',
              })}
            </AppText>
          )}
        </TouchableOpacity>

        <AppText style={styles.noteText}>
          {t('wallet_payment.note', {
            defaultValue:
              'سيتم إرسال طلب الدفع إلى هذا الرقم لإتمام العملية.',
          })}
        </AppText>
      </View>
    </>
  );

  const renderSentScreen = () => (
    <>
      <AppHeader
        title={t('wallet_payment.sent_title', {
          defaultValue: 'تم إرسال طلب الدفع',
        })}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.sentWrap}>
        <AppText style={styles.sentSubtitle}>
          {t('wallet_payment.sent_subtitle', {
            defaultValue: 'لقد أرسلنا طلب دفع إلى محفظتك على هذا الرقم',
          })}
        </AppText>

        <AppText weight="bold" style={styles.sentPhone}>
          {displaySentPhone()}
        </AppText>

        <PhoneWallet />

        <AppText style={styles.checkText}>
          {t('wallet_payment.check_phone', {
            defaultValue: 'تحقق من هاتفك لإكمال الدفع',
          })}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.confirmPaymentBtn}
          onPress={handleConfirmPayment}>
          <AppText weight="bold" style={styles.confirmPaymentText}>
            {t('wallet_payment.confirm_payment', {
              defaultValue: 'تأكيد إتمام الدفع',
            })}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.backHomeBtn}
          onPress={() => navigation.navigate('HomeStack')}>
          <AppText weight="bold" style={styles.backHomeText}>
            {t('wallet_payment.back_home', {
              defaultValue: 'العودة للرئيسية',
            })}
          </AppText>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {sent ? renderSentScreen() : renderInputScreen()}
        </ScrollView>
      </KeyboardAvoidingView>

      {renderInstructionsSheet()}
    </SafeAreaView>
  );
};

export default OrderPhoneWalletScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  howLink: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 42,
  },
  howText: {
    fontSize: 14,
    color: COLORS.main,
    marginHorizontal: 4,
  },

  formWrap: {
    width: '100%',
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 10,
  },

  phoneInputBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 32,
  },

  countryBox: {
    height: '100%',
    width: 98,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  flag: {
    fontSize: 18,
    marginHorizontal: 4,
  },
  countryCode: {
    fontSize: 13,
    color: COLORS.muted,
    marginHorizontal: 4,
  },

  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  submitBtn: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitText: {
    fontSize: 15,
    color: COLORS.white,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.lightText,
    textAlign: 'center',
  },

  sentWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  sentTitle: {
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  sentSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  sentPhone: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 5,
    marginBottom: 30,
  },
  walletImage: {
    width: 150,
    height: 150,
    marginBottom: 22,
  },
  checkText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 28,
  },
  confirmPaymentBtn: {
    width: '100%',
    height: 52,
    borderRadius: 11,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmPaymentText: {
    fontSize: 15,
    color: COLORS.white,
  },
  backHomeBtn: {
    width: '100%',
    height: 50,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHomeText: {
    fontSize: 15,
    color: COLORS.main,
  },

  instructionsOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  instructionsSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 30,
    minHeight: 500,
  },
  instructionsHandle: {
    width: 48,
    height: 5,
    borderRadius: 20,
    backgroundColor: COLORS.handle,
    alignSelf: 'center',
    marginBottom: 18,
  },
  instructionsTitle: {
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  instructionsStepsWrap: {
    width: '100%',
  },
  instructionStepRow: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  instructionNumberWrap: {
    width: 34,
    alignItems: 'center',
  },
  instructionNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: COLORS.main,
    backgroundColor: '#F8FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumber: {
    fontSize: 13,
    color: COLORS.text,
  },
  instructionLine: {
    width: 1.4,
    minHeight: 34,
    backgroundColor: COLORS.main,
    marginTop: 3,
    marginBottom: 3,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 28,
    textAlign: 'auto',
    paddingTop: 1,
    marginHorizontal: 12,
  },
});