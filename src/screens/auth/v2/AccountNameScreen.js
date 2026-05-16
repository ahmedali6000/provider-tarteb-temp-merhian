import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Keyboard, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import AppInput from '../../../component/AppInput';
import BackButton from '../../../component/BackButton';
import LoadingModal from '../../../component/LoadingModal';
import { useTranslation } from 'react-i18next';
import { completeLogin, registerUser } from '../../../services/authService';
import { useDispatch } from 'react-redux';
import useAppFont from '../../../hooks/useAppFont';

const userIcon = require('./../../../../assets/app/images/icons/user_icon.png');

const AccountNameScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
   const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneNumber = route.params?.phone || '';
 const {fontFamily} = useAppFont();
  const handleContinue = async () => {
  Keyboard.dismiss();

  if (!isFormValid) return;

  setLoading(true);

  try {
    const response = await registerUser(phoneNumber, firstName, lastName);

    // 🔥 نفس login بالظبط
    await completeLogin(response, dispatch);

    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Home' }],
    // });

  } catch (err) {
    const errorMessage =
      err?.response?.data?.message ||
      err?.message ||
      t('login.otp_request_failed');

    Alert.alert(t('common.error'), errorMessage);
  } finally {
    setLoading(false);
  }
};

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '';

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
            <AppText weight="bold" style={styles.title}>{t('account_name.title')}</AppText>
            <AppText style={styles.subtitle}>{t('account_name.subtitle')}</AppText>
          </View>

          <AppInput
            label={t('account_name.first_name_label')}
            placeholder={t('account_name.first_name_placeholder')}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            icon={userIcon}
            style={[styles.inputField]}
          />

          <AppInput
            label={t('account_name.last_name_label')}
            placeholder={t('account_name.last_name_placeholder')}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            icon={userIcon}
            style={[styles.inputField,fontFamily]}
          />

          <AppButton 
            title={t('account_name.continue_button')}
            onPress={handleContinue}
            style={[styles.continueButton, !isFormValid && styles.disabledButton]}
            textStyle={!isFormValid ? styles.disabledButtonText : {}}
            disabled={!isFormValid}
          />
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
  inputField: {
    width: '90%',
    marginBottom: 20,
  },
  continueButton: {
    width: '90%',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A8E6FF',
  },
  disabledButtonText: {
    color: '#fff',
  },
});

export default AccountNameScreen;
