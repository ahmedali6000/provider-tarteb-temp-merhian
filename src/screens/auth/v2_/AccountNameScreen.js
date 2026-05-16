import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import AppInput from '../../../component/AppInput'; // Import the new CustomInput component
import BackButton from '../../../component/BackButton'; // Import the new BackButton component
import { useTranslation } from 'react-i18next';

// Assuming you have an icon for the input fields, e.g., a user icon
const userIcon = require('./../../../../assets/app/images/icons/user_icon.png'); // Placeholder, replace with actual path

const AccountNameScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleContinue = () => {
    Keyboard.dismiss();
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    // Implement logic to save names or navigate to next screen
    // For now, just log
  };

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '';

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
            <AppText weight="bold" style={styles.title}>{t('account_name.title')}</AppText>
            <AppText style={styles.subtitle}>{t('account_name.subtitle')}</AppText>
          </View>

          <AppInput
            label={t('account_name.first_name_label')}
            placeholder={t('account_name.first_name_placeholder')}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            icon={userIcon} // Use the user icon
            style={styles.inputField}
          />

          <AppInput
            label={t('account_name.last_name_label')}
            placeholder={t('account_name.last_name_placeholder')}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            icon={userIcon} // Use the user icon
            style={styles.inputField}
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
