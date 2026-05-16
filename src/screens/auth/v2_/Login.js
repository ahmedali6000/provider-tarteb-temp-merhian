import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Keyboard, I18nManager } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import SocialButton from '../../../component/SocialButton';
import PhoneInput from '../../../component/PhoneInput';
import AppText from '../../../shared/AppText';  
import CountryBottomSheet from '../../../component/CountryBottomSheet';
import { countries , validatePhoneNumber } from '../../../utils/DATA';
import { useTranslation } from 'react-i18next';
 

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // مصر افتراضياً
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const {t,i18n} = useTranslation();

  const handlePhoneChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
    if (error) setError(null);
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    
    const validation = validatePhoneNumber(phoneNumber, selectedCountry);
    
    if (!validation.isValid) {
      console.error('no');
      setError(validation.error);
      return;
    }

    console.log('Yes');
    console.log('Sending to API:', selectedCountry.code + validation.cleanNumber);
    
    navigation.navigate('OTPScreen', { phone: selectedCountry.code + validation.cleanNumber });
  };
   
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']} 
        locations={[0, 0.4]} 
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
             
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.welcomeTitle}>{t('login.welcome')}</AppText>
            <AppText style={styles.welcomeSubtitle}>{t('login.subtitle')}</AppText>
          </View>

          {/* حقل إدخال الهاتف */}
          <View style={styles.inputSection}>
            <AppText style={styles.inputLabel}>{t('login.phone')}</AppText>
            <PhoneInput 
              value={phoneNumber} 
              onChangeText={handlePhoneChange}
              country={selectedCountry}
              onOpenSheet={() => setIsSheetVisible(true)}
              error={error}
              onClear={() => setPhoneNumber('')}
            />
          </View>

          {/* الشروط والأحكام */}
          <TouchableOpacity 
            style={styles.termsContainer} 
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkedBox]}>
              {agreed && <View style={styles.checkMark} />}
            </View>
            <View style={styles.termsTextWrapper}>
              <AppText style={styles.termsText}>{t('login.agree')}</AppText>
              <TouchableOpacity>
                <AppText style={styles.termsLink}>{t('login.terms')}</AppText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* زر المتابعة */}
          <AppButton 
            title={t('login.continue')} 
            onPress={handleContinue}
            style={[styles.mainButton, !agreed && styles.disabledButton]}
            textStyle={!agreed ? styles.disabledButtonText : {}}
          />

          {/* فاصل "أو" */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>{t('login.or')}</AppText>
            <View style={styles.dividerLine} />
          </View>

          {/* أزرار التواصل الاجتماعي */}
          <View style={styles.socialContainer}>
            <SocialButton 
              title={t('login.google')} 
              icon={require('./../../../../assets/app/images/icons/google-icon.png')} 
              onPress={() => {}}
            />
            <SocialButton 
              title={t('login.apple')} 
              icon={require('./../../../../assets/app/images/icons/apple-icon.png')} 
              type="apple"
              onPress={() => {}}
            />
          </View>

          {/* هل أنت مقدم خدمة؟ */}
          <View style={styles.footerContainer}>
            <AppText weight="bold" style={styles.footerTitle}>{t('login.provider')}</AppText>
            <View style={styles.footerSubtitleWrapper}>
              <AppText style={styles.footerSubtitle}>{t('login.provider_sub')}</AppText>
              <TouchableOpacity>
                <AppText weight="bold" style={styles.downloadLink}>{t('login.download')}</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* قائمة اختيار الدولة */}
      <CountryBottomSheet 
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSelect={(country) => {
          setSelectedCountry(country);
          setError(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:50,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: 'stretch',
    paddingTop: 40,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  welcomeTitle: {
    fontSize: 28,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },

  welcomeSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  inputSection: {
    width: '100%',
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginStart: 5,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#3498db',
    marginStart: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkedBox: {
    backgroundColor: '#3498db',
  },

  checkMark: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFF',
    marginTop: -2,
  },

  termsTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginStart:10
  },

  termsText: {
    fontSize: 14,
    color: '#666',
  },

  termsLink: {
    fontSize: 14,
    color: '#3498db',
    textDecorationLine: 'underline',
  },

  mainButton: {
    backgroundColor: '#3498db',
  },

  disabledButton: {
    backgroundColor: '#D6EAF8',
  },

  disabledButtonText: {
    color: '#FFF',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },

  socialContainer: {
    width: '100%',
    marginBottom: 30,
  },

  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },

  footerTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },

  footerSubtitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerSubtitle: {
    fontSize: 13,
    color: '#888',
  },

  downloadLink: {
    fontSize: 13,
    color: '#f39c12',
  },
});

export default LoginScreen;