import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import AppButton from './../../../component/AppButton';
import AppText from './../../../shared/AppText';
import BackButton from './../../../component/BackButton';
import LoadingModal from './../../../component/LoadingModal';
import { useTranslation } from 'react-i18next';
import {
  verifyOtp,
  verifySocialOtp,
  requestOtp,
  completeLogin,
} from '../../../services/authService';
import { useDispatch } from 'react-redux';

const CELL_COUNT = 4;

const OTPScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneNumber = route.params?.phone || '';

  // social أو phone
  const flow = route.params?.flow || 'phone';

  // بيانات جوجل أو أبل القادمة من CompleteMissingDataScreen
  const socialData = route.params?.socialData || null;

  const ref = useBlurOnFulfill({
    value,
    cellCount: CELL_COUNT,
  });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    let interval = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setResendEnabled(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    Keyboard.dismiss();

    if (value.length !== CELL_COUNT) {
      Alert.alert(t('الكود خطأ'), 'الكود الذي ادخلته غير صحيح ..');
      return;
    }

    setLoading(true);

    try {
      let response;

      /**
       * حالة تسجيل الدخول بجوجل أو أبل
       * هنا المستخدم بالفعل كتب الاسم والهاتف في CompleteMissingDataScreen
       * وبعد OTP نعمل create/update user ثم login
       */
      if (flow === 'social' && socialData) {
        response = await verifySocialOtp({
          phoneNumber,
          otp: value,
          provider: socialData.provider,
          providerId: socialData.providerId,
          email: socialData.email,
          name: socialData.name,
        });

        await completeLogin(response, dispatch);
        return;
      }

      /**
       * حالة تسجيل الدخول العادية بالهاتف
       */
      response = await verifyOtp(phoneNumber, value);

      // مستخدم جديد في التسجيل العادي
      if (response.is_new_user) {
        navigation.navigate('AccountNameScreen', {
          phone: phoneNumber,
        });
        return;
      }

      // مستخدم قديم في التسجيل العادي
      await completeLogin(response, dispatch);

      // لو عندك Root Navigator بيقرأ token من redux، مش لازم reset هنا
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Home' }],
      // });

    } catch (err) {
      alert(err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('login.otp_request_failed');

       Alert.alert(t('الكود خطأ'), 'الكود الذي ادخلته غير صحيح ..');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!resendEnabled) return;

    setLoading(true);

    try {
      await requestOtp(phoneNumber);

      setTimer(30);
      setResendEnabled(false);
      setValue('');

     Alert.alert(t('عملية ناجحة'), 'تم التأكيد بنجاح  ..');
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('otp.resend_failed');

      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = value.length === CELL_COUNT;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LoadingModal visible={loading} />

      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']}
        locations={[0, 0.4]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.title}>
              {t('otp.title')}
            </AppText>

            <AppText style={styles.subtitle}>
              {t('otp.subtitle', { phone: phoneNumber })}
            </AppText>
          </View>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <View
                onLayout={getCellOnLayoutHandler(index)}
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                <AppText style={styles.cellText} weight="bold">
                  {symbol || (isFocused ? <Cursor /> : null)}
                </AppText>
              </View>
            )}
          />

          <AppButton
            title={t('otp.verify')}
            onPress={handleVerify}
            style={[
              styles.verifyButton,
              !isOtpComplete && styles.disabledButton,
            ]}
            textStyle={!isOtpComplete ? styles.disabledButtonText : {}}
            disabled={!isOtpComplete}
          />

          <View style={styles.resendContainer}>
            <AppText style={styles.resendText}>
              {t('otp.resend_prefix')}
            </AppText>

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={!resendEnabled}>
              <AppText
                weight="bold"
                style={[
                  styles.resendLink,
                  !resendEnabled && styles.disabledResendLink,
                ]}>
                {resendEnabled
                  ? t('otp.resend_now')
                  : t('otp.resend_timer', { time: timer })}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  codeFieldRoot: {
    marginTop: 20,
    width: 280,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 40,
    flexDirection: 'row-reverse',
  },
  cell: {
    width: 60,
    height: 60,
    lineHeight: 58,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCell: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cellText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  verifyButton: {
    width: '90%',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#A8E6FF',
  },
  disabledButtonText: {
    color: '#fff',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
  },
  disabledResendLink: {
    color: '#ccc',
  },
});

export default OTPScreen;