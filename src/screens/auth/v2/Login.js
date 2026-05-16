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
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import SocialButton from '../../../component/SocialButton';
import PhoneInput from '../../../component/PhoneInput';
import AppText from '../../../shared/AppText';
import CountryBottomSheet from '../../../component/CountryBottomSheet';
import LoadingModal from '../../../component/LoadingModal';
import {countries, validatePhoneNumber} from '../../../utils/DATA';
import {useTranslation} from 'react-i18next';
import {
  requestOtp,
  checkSocialLogin,
  completeLogin,
} from '../../../services/authService';
import Ionicons from '@react-native-vector-icons/ionicons';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {jwtDecode} from 'jwt-decode';
import {useDispatch} from 'react-redux';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '232961590494-ngrqvqsblfo0lh057n6reghlj4l9brsl.apps.googleusercontent.com',
    });
  }, []);

  const handlePhoneChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);

    if (error) {
      setError(null);
    }
  };

const handleContinue = async () => {
  Keyboard.dismiss();

  if (!agreed) {
    
    return;
  }

  const validation = validatePhoneNumber(phoneNumber, selectedCountry);

  if (!validation.isValid) {
    setError(validation.error);
    return;
  }

  const fullPhone = selectedCountry.code + validation.cleanNumber;

  setLoading(true);

  try {
    await requestOtp(fullPhone);

    navigation.navigate('OTPScreen', {
      phone: fullPhone,
    });
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

  const handleSocialResponse = async socialData => {
    try {
      const response = await checkSocialLogin(socialData);

      /**
       * لو المستخدم موجود في قاعدة البيانات
       * وعنده name + phone
       * الباك إند يرجع login = true
       */
      if (response?.status === true && response?.login === true) {
        await completeLogin(response, dispatch);
        return;
      }

      /**
       * لو المستخدم جديد أو ناقص بيانات
       * يروح يكمل الاسم والهاتف
       */
      navigation.navigate('CompleteMissingDataScreen', {
        socialData: {
          ...socialData,
          name: response?.user?.name || socialData.name || '',
          email: response?.user?.email || socialData.email || '',
          phone: response?.user?.phone || '',
        },
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('login.social_failed');

      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const googleUser = userInfo?.user;

      if (!googleUser?.email) {
        Alert.alert(t('common.error'), t('login.social_failed'));
        return;
      }

      const socialData = {
        provider: 'google',
        providerId: googleUser.id || '',
        email: googleUser.email || '',
        name: googleUser.name || '',
        photo: googleUser.photo || '',
        idToken: userInfo?.idToken || '',
      };

      await handleSocialResponse(socialData);
    } catch (err) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      if (err?.code === statusCodes.IN_PROGRESS) {
        return;
      }

      if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(t('common.error'), t('login.play_services_error'));
        return;
      }

      Alert.alert(t('common.error'), err?.message || t('login.social_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    setLoading(true);

    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        Alert.alert(t('common.error'), t('login.social_failed'));
        return;
      }

      let decodedToken = null;

      if (appleAuthRequestResponse.identityToken) {
        decodedToken = jwtDecode(appleAuthRequestResponse.identityToken);
      }

      const firstName = appleAuthRequestResponse?.fullName?.givenName || '';
      const lastName = appleAuthRequestResponse?.fullName?.familyName || '';
      const fullName = `${firstName} ${lastName}`.trim();

      const socialData = {
        provider: 'apple',
        providerId: decodedToken?.sub || appleAuthRequestResponse.user || '',
        email: decodedToken?.email || appleAuthRequestResponse.email || '',
        name: fullName,
        photo: '',
        idToken: appleAuthRequestResponse.identityToken || '',
      };

      await handleSocialResponse(socialData);
    } catch (err) {
      if (err?.code === appleAuth.Error.CANCELED) {
        return;
      }

      Alert.alert(t('common.error'), err?.message || t('login.social_failed'));
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.welcomeTitle}>
              {t('login.welcome')}
            </AppText>

            <AppText style={styles.welcomeSubtitle}>
              {t('login.subtitle')}
            </AppText>
          </View>

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

          <TouchableOpacity
            style={[
              styles.termsContainer,
              {flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse'},
            ]}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.75}>
            <View style={[styles.checkbox, agreed && styles.checkedBox]}>
              {agreed && (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              )}
            </View>

            <View
              style={[
                styles.termsTextWrapper,
                {flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse'},
              ]}>
              <AppText style={styles.termsText}>
                {t('login.agree')}{' '}
              </AppText>

              <TouchableOpacity activeOpacity={0.7} onPress={() =>  navigation.navigate('AboutDocScreen', {
                title: t('about_main.privacy_policy'),
                doc: 'privacy',
              })}>
                <AppText style={styles.termsLink}>
                  {t('login.terms')}
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <AppButton
            title={t('login.continue')}
            onPress={handleContinue}
            style={[styles.mainButton, !agreed && styles.disabledButton]}
            textStyle={!agreed ? styles.disabledButtonText : {}}
            disabled={!agreed}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>{t('login.or')}</AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <SocialButton
              title={t('login.google')}
              icon={require('./../../../../assets/app/images/icons/google-icon.png')}
              onPress={handleGoogleLogin}
            />

            {Platform.OS === 'ios' && (
              <SocialButton
                title={t('login.apple')}
                icon={require('./../../../../assets/app/images/icons/apple-icon.png')}
                type="apple"
                onPress={handleAppleLogin}
              />
            )}
          </View>

          <View style={styles.footerContainer}>
            <AppText weight="bold" style={styles.footerTitle}>
              {t('login.provider')}
            </AppText>

            <View style={styles.footerSubtitleWrapper}>
              <AppText style={styles.footerSubtitle}>
                {t('login.provider_sub')}
              </AppText>

              <TouchableOpacity>
                <AppText weight="bold" style={styles.downloadLink}>
                  {t('login.download')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <CountryBottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSelect={country => {
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
    paddingTop: 50,
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
    textAlign: 'auto',
  },
  termsContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.6,
    borderColor: '#3498db',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  termsTextWrapper: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  termsLink: {
    fontSize: 14,
    color: '#3498db',
    lineHeight: 22,
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
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
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