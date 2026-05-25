import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  Alert,
  I18nManager,
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
import {useTranslation} from 'react-i18next';
import {verifyOtp, requestOtp, completeLogin} from '../../../services/authService';
import {useDispatch} from 'react-redux';

const CELL_COUNT = 4;

const OTPScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const phoneNumber = route.params?.phone || '';
  const joinAsProvider = route.params?.joinAsProvider === true;

  const ref = useBlurOnFulfill({
    value,
    cellCount: CELL_COUNT,
  });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const tr = (key, fallback, options = {}) =>
    t(key, {
      defaultValue: fallback,
      ...options,
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

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const navigateByNextStep = async response => {
    if (response?.login === true) {
      await completeLogin(response, dispatch);
      return;
    }

    const phone = response?.phone || phoneNumber;
    const missingFields = response?.missing_fields || [];
    const existingData = response?.existing_data || {};
    const user = response?.user || {};

    switch (response?.next_step) {
      case 'basic_info':
        navigation.replace('AccountNameScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'complete_missing_data':
        navigation.replace('CompleteMissingDataScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'work_info':
        navigation.replace('ProviderWorkInfoScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'profile_photo':
        navigation.replace('ProviderProfilePhotoScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'front_id_doc':
        navigation.replace('ProviderFrontIdDocScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'rear_id_doc':
        navigation.replace('ProviderRearIdDocScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      case 'completed':
        navigation.replace('ProviderRegistrationThanksScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;

      default:
        navigation.replace('AccountNameScreen', {
          phone,
          missingFields,
          existingData,
          user,
        });
        return;
    }
  };

  const handleCodeChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, CELL_COUNT);
    setValue(numericValue);

    if (otpError) {
      setOtpError('');
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();

    if (!phoneNumber) {
      setOtpError(tr('login.phone_required', 'رقم الهاتف مطلوب'));
      return;
    }

    if (value.length !== CELL_COUNT) {
      setOtpError(tr('otp.invalid_code', 'الكود الذي أدخلته غير صحيح'));
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      const response = await verifyOtp({
        phone: phoneNumber,
        otp: value,
        joinAsProvider,
      });

      await navigateByNextStep(response);
    } catch (err) {
      const statusCode = err?.response?.status;
      const apiMessage = err?.response?.data?.message;

      if (statusCode === 403) {
        setOtpError(tr('otp.invalid_code', 'الكود الذي أدخلته غير صحيح'));
      } else {
        setOtpError(
          apiMessage ||
            err?.message ||
            tr('login.otp_request_failed', 'حدث خطأ، حاول مرة أخرى'),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!resendEnabled) {
      return;
    }

    if (!phoneNumber) {
      setOtpError(tr('login.phone_required', 'رقم الهاتف مطلوب'));
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      await requestOtp(phoneNumber);

      setTimer(30);
      setResendEnabled(false);
      setValue('');

      Alert.alert(
        tr('common.success', 'تم بنجاح'),
        tr('otp.resend_success', 'تم إرسال الكود مرة أخرى'),
      );
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        tr('otp.resend_failed', 'تعذر إعادة إرسال الكود');

      setOtpError(errorMessage);
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

      <SafeAreaView style={{flex: 1}}>
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.title}>
              {t('otp.title')}
            </AppText>

            <AppText style={styles.subtitle}>
              {t('otp.subtitle', {phone: phoneNumber})}
            </AppText>
          </View>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={handleCodeChange}
            cellCount={CELL_COUNT}
            rootStyle={[
              styles.codeFieldRoot,
              !!otpError && styles.codeFieldRootWithError,
            ]}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <View
                onLayout={getCellOnLayoutHandler(index)}
                key={index}
                style={[
                  styles.cell,
                  isFocused && styles.focusCell,
                  !!otpError && styles.errorCell,
                ]}>
                <AppText style={styles.cellText} weight="bold">
                  {symbol || (isFocused ? <Cursor /> : null)}
                </AppText>
              </View>
            )}
          />

          {!!otpError && (
            <AppText style={styles.otpErrorText}>{otpError}</AppText>
          )}

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
                  : t('otp.resend_timer', {time: timer})}
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

  codeFieldRootWithError: {
    marginBottom: 8,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  errorCell: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFFFFF',
  },

  cellText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    writingDirection: 'ltr',
  },

  otpErrorText: {
    width: 280,
    fontSize: 11,
    color: '#FF3B30',
    marginBottom: 28,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
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