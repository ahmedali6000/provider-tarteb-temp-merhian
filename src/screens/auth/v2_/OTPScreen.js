import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Keyboard } from 'react-native';
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
import { useTranslation } from 'react-i18next';

const CELL_COUNT = 4;

const OTPScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const phoneNumber = route.params?.phone || '+20 XXX XXX XXX';

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setResendEnabled(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    Keyboard.dismiss();
    if (value.length === CELL_COUNT) {
      console.log('Verifying OTP:', value);
      navigation.navigate('AccountNameScreen');
    } else {
      console.log(t('otp.enter_full_otp'));
    }
  };

  const handleResendOtp = () => {
    if (!resendEnabled) return;
    setTimer(30);
    setResendEnabled(false);
    setValue('');
    console.log(t('otp.resending_otp'));
  };

  const isOtpComplete = value.length === CELL_COUNT;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']} 
        locations={[0, 0.4]} 
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.title}>{t('otp.title')}</AppText>
            <AppText style={styles.subtitle}>{t('otp.subtitle', { phone: phoneNumber })}</AppText>
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
                <AppText style={styles.cellText}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </AppText>
              </View>
            )}
          />

          <AppButton 
            title={t('otp.verify')} 
            onPress={handleVerify}
            style={[styles.verifyButton, !isOtpComplete && styles.disabledButton]}
            textStyle={!isOtpComplete ? styles.disabledButtonText : {}}
            disabled={!isOtpComplete}
          />

          <View style={styles.resendContainer}>
            <AppText style={styles.resendText}>{t('otp.resend_prefix')}</AppText>
            <TouchableOpacity onPress={handleResendOtp} disabled={!resendEnabled}>
              <AppText style={[styles.resendLink, !resendEnabled && styles.disabledResendLink]}>
                {resendEnabled ? t('otp.resend_now') : t('otp.resend_timer', { time: timer })}
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
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    writingDirection: 'ltr', // Force LTR for numbers
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
    fontWeight: 'bold',
  },
  disabledResendLink: {
    color: '#ccc',
  },
});

export default OTPScreen;
