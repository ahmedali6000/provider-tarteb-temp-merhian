import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import AppInput from '../../../component/AppInput';
import BackButton from '../../../component/BackButton';
import LoadingModal from '../../../component/LoadingModal';
import {useTranslation} from 'react-i18next';
import {completeProviderStep} from '../../../services/authService';

const userIcon = require('./../../../../assets/app/images/icons/user_icon.png');
const idIcon = require('./../../../../assets/app/images/icons/user_id_icon.png');

const AccountNameScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const params = route?.params || {};

  const phoneNumber = params?.phone || '';

  const missingFields = Array.isArray(params?.missingFields)
    ? params.missingFields
    : [];

  const existingData = params?.existingData || {};
  const userFromResponse = params?.user || {};

  const initialName =
    existingData?.name ||
    userFromResponse?.name ||
    '';

  const initialNationalId =
    existingData?.national_id ||
    userFromResponse?.national_id ||
    '';

  const computedMissingFields = useMemo(() => {
    if (missingFields.length > 0) {
      return missingFields;
    }

    const fields = [];

    if (!initialName) {
      fields.push('name');
    }

    if (!initialNationalId) {
      fields.push('national_id');
    }

    return fields;
  }, [missingFields, initialName, initialNationalId]);

  const shouldEditName =
    computedMissingFields.includes('name') || !initialName;

  const shouldShowNationalId =
    computedMissingFields.includes('national_id') || !initialNationalId;

  const [fullName, setFullName] = useState(initialName);
  const [nationalId, setNationalId] = useState(
    initialNationalId ? String(initialNationalId) : '',
  );

  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [nationalIdError, setNationalIdError] = useState('');
  const [serverError, setServerError] = useState('');

  const cleanName = useMemo(() => {
    return fullName.trim().replace(/\s+/g, ' ');
  }, [fullName]);

  const cleanNationalId = useMemo(() => {
    return nationalId.replace(/[^0-9]/g, '');
  }, [nationalId]);

  const validateName = value => {
    const name = value.trim().replace(/\s+/g, ' ');

    if (!name) {
      return t('provider_register.name_required');
    }

    if (name.length < 3) {
      return t('provider_register.invalid_name');
    }

    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name)) {
      return t('provider_register.name_letters_only');
    }

    if (name.split(' ').length < 2) {
      return t('provider_register.full_name_required');
    }

    return '';
  };

  const validateNationalId = value => {
    if (!shouldShowNationalId) {
      return '';
    }

    const onlyNumbers = value.replace(/[^0-9]/g, '');

    if (!onlyNumbers) {
      return t('provider_register.national_id_required');
    }

    if (onlyNumbers.length !== 14) {
      return t('provider_register.invalid_national_id');
    }

    return '';
  };

  const isNameValid =
    cleanName.length >= 3 && cleanName.split(' ').length >= 2;

  const isNationalIdValid =
    !shouldShowNationalId || cleanNationalId.length === 14;

  const isFormValid =
    isNameValid && isNationalIdValid && !nameError && !nationalIdError;

  const handleNameChange = text => {
    if (!shouldEditName) {
      return;
    }

    setFullName(text);
    setServerError('');

    if (nameError) {
      setNameError('');
    }
  };

  const handleNationalIdChange = text => {
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 14);

    setNationalId(numericValue);
    setServerError('');

    if (nationalIdError) {
      setNationalIdError('');
    }
  };

  const handleNameBlur = () => {
    if (!shouldEditName) {
      return;
    }

    setNameError(validateName(fullName));
  };

  const handleNationalIdBlur = () => {
    setNationalIdError(validateNationalId(nationalId));
  };

  const goToNextStep = response => {
    const nextStep = response?.next_step;
    const nextPhone = response?.phone || phoneNumber;

    const nextMissingFields = response?.missing_fields || [];
    const nextExistingData = response?.existing_data || {};
    const nextUser = response?.user || {};

    if (nextStep === 'basic_info') {
      navigation.replace('AccountNameScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'complete_missing_data') {
      navigation.replace('CompleteMissingDataScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'work_info') {
      navigation.replace('ProviderWorkInfoScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'profile_photo') {
      navigation.replace('ProviderProfilePhotoScreen', {
        phone: nextPhone,
      });
      return;
    }

    if (nextStep === 'front_id_doc') {
      navigation.replace('ProviderFrontIdDocScreen', {
        phone: nextPhone,
      });
      return;
    }

    if (nextStep === 'rear_id_doc') {
      navigation.replace('ProviderRearIdDocScreen', {
        phone: nextPhone,
      });
      return;
    }

    if (nextStep === 'completed') {
      navigation.replace('ProviderRegistrationThanksScreen', {
        phone: nextPhone,
      });
      return;
    }

    navigation.replace('ProviderWorkInfoScreen', {
      phone: nextPhone,
      missingFields: nextMissingFields,
      existingData: nextExistingData,
      user: nextUser,
    });
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    const currentNameError = shouldEditName ? validateName(fullName) : '';
    const currentNationalIdError = validateNationalId(nationalId);

    setNameError(currentNameError);
    setNationalIdError(currentNationalIdError);
    setServerError('');

    if (currentNameError || currentNationalIdError) {
      return;
    }

    if (!phoneNumber) {
      setServerError(t('login.phone_required'));
      return;
    }

    setLoading(true);

    try {
      const response = await completeProviderStep({
        step: 'basic_info',
        phone: phoneNumber,
        name: cleanName,
        nationalId: cleanNationalId,
      });

      goToNextStep(response);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('login.otp_request_failed');

      setServerError(errorMessage);
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

      <SafeAreaView style={styles.safeArea}>
        <BackButton onPress={() => navigation.goBack()} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <View style={styles.headerContainer}>
                  <AppText weight="bold" style={styles.title}>
                    {t('provider_register.basic_info_title')}
                  </AppText>

                  <AppText style={styles.subtitle}>
                    {t('provider_register.basic_info_subtitle')}
                  </AppText>

                  <View style={styles.progressTrack}>
                    <View style={styles.progressActive} />
                  </View>
                </View>

                <View
                  style={styles.fieldWrapper}
                  pointerEvents={shouldEditName ? 'auto' : 'none'}>
                  <AppInput
                    label={t('provider_register.full_name')}
                    placeholder={t('provider_register.full_name_placeholder')}
                    value={fullName}
                    onChangeText={handleNameChange}
                    onBlur={handleNameBlur}
                    autoCapitalize="words"
                    icon={userIcon}
                    style={[
                      styles.inputField,
                      !shouldEditName && styles.disabledInput,
                    ]}
                  />

                  {!!nameError && (
                    <AppText style={styles.errorText}>{nameError}</AppText>
                  )}
                </View>

                {shouldShowNationalId && (
                  <View style={styles.fieldWrapper}>
                    <AppInput
                      label={t('provider_register.national_id')}
                      placeholder={t(
                        'provider_register.national_id_placeholder',
                      )}
                      value={nationalId}
                      onChangeText={handleNationalIdChange}
                      onBlur={handleNationalIdBlur}
                      keyboardType="number-pad"
                      maxLength={14}
                      icon={idIcon}
                      style={styles.inputField}
                    />

                    {!!nationalIdError && (
                      <AppText style={styles.errorText}>
                        {nationalIdError}
                      </AppText>
                    )}
                  </View>
                )}

                {!!serverError && (
                  <AppText style={styles.serverErrorText}>
                    {serverError}
                  </AppText>
                )}

                <AppButton
                  title={t('provider_register.continue')}
                  onPress={handleContinue}
                  style={[
                    styles.continueButton,
                    !isFormValid && styles.disabledButton,
                  ]}
                  textStyle={!isFormValid ? styles.disabledButtonText : {}}
                  disabled={!isFormValid}
                />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 130 : 170,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  headerContainer: {
    marginBottom: 34,
    alignItems: 'center',
    width: '100%',
  },

  title: {
    fontSize: 25,
    color: '#1C1C1C',
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
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
  },

  progressActive: {
    width: '40%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F58220',
    alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },

  fieldWrapper: {
    width: '100%',
    marginBottom: 14,
  },

  inputField: {
    width: '100%',
  },

  disabledInput: {
    opacity: 0.65,
  },

  errorText: {
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 6,
    marginHorizontal: 4,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  serverErrorText: {
    width: '100%',
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 2,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  continueButton: {
    width: '100%',
    marginTop: 14,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#3498db',
  },

  disabledButton: {
    backgroundColor: '#D6EAF8',
  },

  disabledButtonText: {
    color: '#FFFFFF',
  },
});

export default AccountNameScreen;