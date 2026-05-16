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
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import PhoneInput from '../../../component/PhoneInput';
import AppText from '../../../shared/AppText';
import CountryBottomSheet from '../../../component/CountryBottomSheet';
import LoadingModal from '../../../component/LoadingModal';
import BackButton from '../../../component/BackButton';
import {countries, validatePhoneNumber} from '../../../utils/DATA';
import {useTranslation} from 'react-i18next';
import {requestOtp} from '../../../services/authService';

const CompleteMissingDataScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const socialData = route.params?.socialData || {};

  const [name, setName] = useState(socialData?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);

    if (phoneError) {
      setPhoneError(null);
    }
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      setNameError(t('complete_missing_data.name_required'));
      return;
    }

    const validation = validatePhoneNumber(phoneNumber, selectedCountry);

    if (!validation.isValid) {
      setPhoneError(validation.error);
      return;
    }

    const fullPhone = selectedCountry.code + validation.cleanNumber;

    setLoading(true);

    try {
      await requestOtp(fullPhone);

      navigation.navigate('OTPScreen', {
        phone: fullPhone,
        flow: 'social',
        socialData: {
          ...socialData,
          name: cleanName,
        },
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
            <AppText weight="bold" style={styles.welcomeTitle}>
              {t('complete_missing_data.title')}
            </AppText>

            <AppText style={styles.welcomeSubtitle}>
              {t('complete_missing_data.subtitle')}
            </AppText>
          </View>

          <View style={styles.inputSection}>
            <AppText style={styles.inputLabel}>
              {t('complete_missing_data.name')}
            </AppText>

            <TextInput
              value={name}
              onChangeText={text => {
                setName(text);
                if (nameError) {
                  setNameError(null);
                }
              }}
              placeholder={t('complete_missing_data.name_placeholder')}
              placeholderTextColor="#A0A0A0"
              style={[
                styles.nameInput,
                nameError && styles.inputError,
                {textAlign: I18nManager.isRTL ? 'right' : 'left'},
              ]}
            />

            {!!nameError && (
              <AppText style={styles.errorText}>{nameError}</AppText>
            )}
          </View>

          <View style={styles.inputSection}>
            <AppText style={styles.inputLabel}>
              {t('complete_missing_data.phone')}
            </AppText>

            <PhoneInput
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              country={selectedCountry}
              onOpenSheet={() => setIsSheetVisible(true)}
              error={phoneError}
              onClear={() => setPhoneNumber('')}
            />
          </View>

          <AppButton
            title={t('complete_missing_data.continue')}
            onPress={handleContinue}
            style={styles.mainButton}
          />

          {!!socialData?.email && (
            <View style={styles.emailBox}>
              <AppText style={styles.emailLabel}>
                {t('complete_missing_data.connected_email')}
              </AppText>
              <AppText weight="bold" style={styles.emailText}>
                {socialData.email}
              </AppText>
            </View>
          )}
        </View>
      </SafeAreaView>

      <CountryBottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSelect={country => {
          setSelectedCountry(country);
          setPhoneError(null);
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
    paddingTop: 55,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
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
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginStart: 5,
    textAlign: 'auto',
  },
  nameInput: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF1F4',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    marginTop: 7,
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'auto',
  },
  mainButton: {
    backgroundColor: '#3498db',
    marginTop: 12,
  },
  emailBox: {
    marginTop: 22,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: '#EEF1F4',
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#222',
    textAlign: 'center',
  },
});

export default CompleteMissingDataScreen;