import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  Alert,
  I18nManager,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import AppButton from '../../../component/AppButton';
import PhoneInput from '../../../component/PhoneInput';
import AppText from '../../../shared/AppText';
import CountryBottomSheet from '../../../component/CountryBottomSheet';
import LoadingModal from '../../../component/LoadingModal';
import {countries, validatePhoneNumber} from '../../../utils/DATA';
import {useTranslation} from 'react-i18next';
import {
  requestOtp,
  checkProviderPhone,
} from '../../../services/authService';
import Ionicons from '@react-native-vector-icons/ionicons';

const CLIENT_APP_ONE_LINK = 'https://tarteb.app/client';

const LoginScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clientAccountModalVisible, setClientAccountModalVisible] =
    useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const handlePhoneChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);

    if (error) {
      setError(null);
    }
  };

  const getValidatedFullPhone = () => {
    const validation = validatePhoneNumber(phoneNumber, selectedCountry);

    if (!validation.isValid) {
      setError(validation.error);
      return null;
    }

    return selectedCountry.code + validation.cleanNumber;
  };

  const sendOtpAndNavigate = async ({fullPhone, joinAsProvider = false}) => {
    await requestOtp(fullPhone);

    navigation.navigate('OTPScreen', {
      phone: fullPhone,
      joinAsProvider,
    });
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    if (!agreed) {
      return;
    }

    const fullPhone = getValidatedFullPhone();

    if (!fullPhone) {
      return;
    }

    setLoading(true);

    try {
      const checkResponse = await checkProviderPhone(fullPhone);

      if (checkResponse?.needs_provider_confirmation) {
        setPendingPhone(fullPhone);
        setClientAccountModalVisible(true);
        return;
      }

      await sendOtpAndNavigate({
        fullPhone,
        joinAsProvider: false,
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

  const handleDownloadClientApp = async () => {
    try {
      setClientAccountModalVisible(false);
      await Linking.openURL(CLIENT_APP_ONE_LINK);
    } catch (err) {
      Alert.alert(
        tr('common.error', 'خطأ'),
        tr('login.cannot_open_link', 'تعذر فتح الرابط'),
      );
    }
  };

  const handleJoinAsProvider = async () => {
    if (!pendingPhone) {
      return;
    }

    setClientAccountModalVisible(false);
    setLoading(true);

    try {
      await sendOtpAndNavigate({
        fullPhone: pendingPhone,
        joinAsProvider: true,
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

  const renderClientAccountModal = () => {
    return (
      <Modal
        isVisible={clientAccountModalVisible}
        backdropOpacity={0.55}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
        useNativeDriver
        hideModalContentWhileAnimating
        onBackdropPress={() => setClientAccountModalVisible(false)}
        onBackButtonPress={() => setClientAccountModalVisible(false)}
        style={styles.modalWrapper}>
        <View style={styles.modalCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.modalCloseButton}
            onPress={() => setClientAccountModalVisible(false)}>
            <Ionicons name="close" size={28} color="#8B8B8B" />
          </TouchableOpacity>

          <AppText weight="bold" style={styles.modalTitle}>
            {tr(
              'provider_join_modal.title',
              'الانضمام كمقدم خدمة',
            )}
          </AppText>

          <AppText style={styles.modalDescription}>
            {tr(
              'provider_join_modal.description',
              'هذا الرقم مسجل حاليًا في تطبيق العميل. إذا كنت ترغب في الانضمام إلينا كمقدم خدمة يمكنك استكمال التسجيل الآن، أو تحميل تطبيق العميل إذا كنت دخلت بالخطأ.',
            )}
          </AppText>

          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalSecondaryButton}
              onPress={handleDownloadClientApp}>
              <AppText weight="bold" style={styles.modalSecondaryButtonText}>
                {tr(
                  'provider_join_modal.download_client_app',
                  'تحميل تطبيق العميل',
                )}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalPrimaryButton}
              onPress={handleJoinAsProvider}>
              <AppText weight="bold" style={styles.modalPrimaryButtonText}>
                {tr(
                  'provider_join_modal.join_as_provider',
                  'نعم، أريد الانضمام',
                )}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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

            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>
          </View>

          <View style={styles.inputSection}>
            <AppText style={styles.inputLabel}>
              {t('login.phone')}
            </AppText>

            <PhoneInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              country={selectedCountry}
              onOpenSheet={() => setIsSheetVisible(true)}
              error={error}
              onClear={() => {
                setPhoneNumber('');
                setError(null);
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreed(prev => !prev)}
            activeOpacity={0.75}>
            <View style={[styles.checkbox, agreed && styles.checkedBox]}>
              {agreed && (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              )}
            </View>

            <View style={styles.termsTextWrapper}>
              <AppText style={styles.termsText}>
                {t('login.agree')}{' '}
              </AppText>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('AboutDocScreen', {
                    title: t('about_main.privacy_policy'),
                    doc: 'privacy',
                  })
                }>
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

      {renderClientAccountModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 38,
  },

  welcomeTitle: {
    fontSize: 25,
    color: '#1C1C1C',
    marginBottom: 30,
    textAlign: 'center',
  },

  welcomeSubtitle: {
    fontSize: 13,
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: 21,
  },

  progressTrack: {
    width: '90%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
    overflow: 'hidden',
    marginTop: 25,
    marginBottom: 20,
  },

  progressActive: {
    width: '20%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F58220',
    alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },

  inputSection: {
    width: '100%',
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
    marginEnd: 5,
    textAlign: 'auto',
  },

  termsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    marginBottom: 28,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#3498db',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
  },

  checkedBox: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },

  termsTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },

  termsText: {
    fontSize: 11.5,
    color: '#777777',
    lineHeight: 20,
  },

  termsLink: {
    fontSize: 11.5,
    color: '#3498db',
    lineHeight: 20,
    textDecorationLine: 'underline',
  },

  mainButton: {
    backgroundColor: '#3498db',
    height: 52,
    borderRadius: 13,
  },

  disabledButton: {
    backgroundColor: '#D6EAF8',
  },

  disabledButtonText: {
    color: '#FFFFFF',
  },

  modalWrapper: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 22,
    alignItems: 'center',
  },

  modalCloseButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 23,
    color: '#1C1C1C',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },

  modalDescription: {
    width: '92%',
    fontSize: 13,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 24,
  },

  modalButtonsRow: {
    width: '100%',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalPrimaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: I18nManager.isRTL ? 0 : 7,
    marginEnd: I18nManager.isRTL ? 7 : 0,
  },

  modalSecondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: I18nManager.isRTL ? 0 : 7,
    marginStart: I18nManager.isRTL ? 7 : 0,
  },

  modalPrimaryButtonText: {
    fontSize: 12.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  modalSecondaryButtonText: {
    fontSize: 12.5,
    color: '#3498db',
    textAlign: 'center',
  },
});

export default LoginScreen;