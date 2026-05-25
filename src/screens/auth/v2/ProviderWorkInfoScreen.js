import React, {useEffect, useMemo, useState} from 'react';
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
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import AppInput from '../../../component/AppInput';
import BackButton from '../../../component/BackButton';
import LoadingModal from '../../../component/LoadingModal';
import {
  completeProviderStep,
  getHomeCategories,
} from '../../../services/authService';

const ProviderWorkInfoScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const phoneNumber = route.params?.phone || '';

  const missingFields = Array.isArray(route.params?.missingFields)
    ? route.params.missingFields
    : [];

  const existingData = route.params?.existingData || {};
  const userFromResponse = route.params?.user || {};

  const initialCategoryId =
    existingData?.category_id ||
    userFromResponse?.category_id ||
    null;

  const initialExperienceYears =
    existingData?.experience_years !== undefined &&
    existingData?.experience_years !== null
      ? String(existingData.experience_years)
      : userFromResponse?.experience_years !== undefined &&
        userFromResponse?.experience_years !== null
      ? String(userFromResponse.experience_years)
      : '';

  const shouldEditCategory =
    missingFields.length === 0
      ? !initialCategoryId
      : missingFields.includes('category_id') || !initialCategoryId;

  const shouldEditExperience =
    missingFields.length === 0
      ? !initialExperienceYears
      : missingFields.includes('experience_years') || !initialExperienceYears;

  const [categoriesGroups, setCategoriesGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [experienceYears, setExperienceYears] = useState(initialExperienceYears);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoryError, setCategoryError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!initialCategoryId || !categoriesGroups?.length) {
      return;
    }

    const allCategories = [];

    categoriesGroups.forEach(group => {
      if (Array.isArray(group?.categories)) {
        allCategories.push(...group.categories);
      }
    });

    const matchedCategory = allCategories.find(
      category => Number(category?.id) === Number(initialCategoryId),
    );

    if (matchedCategory) {
      setSelectedCategory(matchedCategory);
      return;
    }

    setSelectedCategory({
      id: initialCategoryId,
      name:
        existingData?.category_name ||
        userFromResponse?.category_name ||
        t('provider_register.saved_work_field', {
          defaultValue: 'القسم المسجل سابقًا',
        }),
    });
  }, [
    categoriesGroups,
    initialCategoryId,
    existingData?.category_name,
    userFromResponse?.category_name,
    t,
  ]);

  const isFormValid = useMemo(() => {
    return (
      !!selectedCategory?.id &&
      experienceYears !== '' &&
      !categoryError &&
      !experienceError
    );
  }, [selectedCategory, experienceYears, categoryError, experienceError]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setServerError('');

    try {
      const response = await getHomeCategories();
      setCategoriesGroups(response?.data || []);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('provider_register.categories_load_failed');

      setServerError(errorMessage);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const validateCategory = () => {
    if (!selectedCategory?.id) {
      return t('provider_register.work_field_required');
    }

    return '';
  };

  const validateExperience = value => {
    const cleaned = String(value || '').replace(/[^0-9]/g, '');

    if (!cleaned) {
      return t('provider_register.experience_required');
    }

    const years = Number(cleaned);

    if (Number.isNaN(years) || years < 0 || years > 60) {
      return t('provider_register.experience_invalid');
    }

    return '';
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
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'front_id_doc') {
      navigation.replace('ProviderFrontIdDocScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'rear_id_doc') {
      navigation.replace('ProviderRearIdDocScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    if (nextStep === 'completed') {
      navigation.replace('ProviderRegistrationThanksScreen', {
        phone: nextPhone,
        missingFields: nextMissingFields,
        existingData: nextExistingData,
        user: nextUser,
      });
      return;
    }

    navigation.replace('ProviderProfilePhotoScreen', {
      phone: nextPhone,
      missingFields: nextMissingFields,
      existingData: nextExistingData,
      user: nextUser,
    });
  };

  const handleExperienceChange = text => {
    if (!shouldEditExperience) {
      return;
    }

    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 2);
    setExperienceYears(numericValue);
    setServerError('');

    if (experienceError) {
      setExperienceError('');
    }
  };

  const handleSelectCategory = category => {
    if (!shouldEditCategory) {
      return;
    }

    setSelectedCategory(category);
    setCategoryError('');
    setServerError('');
    setSheetVisible(false);
  };

  const openCategorySheet = () => {
    if (!shouldEditCategory) {
      return;
    }

    setSheetVisible(true);
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    const currentCategoryError = validateCategory();
    const currentExperienceError = validateExperience(experienceYears);

    setCategoryError(currentCategoryError);
    setExperienceError(currentExperienceError);
    setServerError('');

    if (currentCategoryError || currentExperienceError) {
      return;
    }

    if (!phoneNumber) {
      setServerError(t('login.phone_required'));
      return;
    }

    setLoading(true);

    try {
      const response = await completeProviderStep({
        step: 'work_info',
        phone: phoneNumber,
        categoryId: selectedCategory.id,
        experienceYears: Number(experienceYears),
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

  const renderCategoryGroup = ({item}) => {
    if (!item?.categories?.length) {
      return null;
    }

    return (
      <View style={styles.sheetGroup}>
        <AppText weight="bold" style={styles.sheetGroupTitle}>
          {item.name}
        </AppText>

        <View style={styles.categoriesGrid}>
          {item.categories.map(category => {
            const active = Number(selectedCategory?.id) === Number(category.id);

            return (
              <TouchableOpacity
                key={String(category.id)}
                activeOpacity={0.75}
                style={[
                  styles.categoryCard,
                  active && styles.categoryCardActive,
                ]}
                onPress={() => handleSelectCategory(category)}>
                <View
                  style={[
                    styles.categoryImageBox,
                    active && styles.categoryImageBoxActive,
                  ]}>
                  {!!category.image && (
                    <Image
                      source={{uri: category.image}}
                      style={styles.categoryImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <AppText numberOfLines={2} style={styles.categoryName}>
                  {category.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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

      <SafeAreaView style={styles.safeArea}>
        <BackButton onPress={() => navigation.goBack()} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                    {t('provider_register.work_info_title')}
                  </AppText>

                  <AppText style={styles.subtitle}>
                    {t('provider_register.work_info_subtitle')}
                  </AppText>

                  <View style={styles.progressTrack}>
                    <View style={styles.progressActive} />
                  </View>
                </View>

                <View style={styles.fieldWrapper}>
                  <AppText style={styles.inputLabel}>
                    {t('provider_register.work_field')}
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={shouldEditCategory ? 0.8 : 1}
                    style={[
                      styles.selectBox,
                      !!categoryError && styles.inputErrorBorder,
                      !shouldEditCategory && styles.disabledBox,
                    ]}
                    onPress={openCategorySheet}>
                    <Ionicons
                      name={shouldEditCategory ? 'chevron-down' : 'lock-closed-outline'}
                      size={18}
                      color="#1C1C1C"
                    />

                    <AppText
                      numberOfLines={1}
                      style={[
                        styles.selectText,
                        !selectedCategory && styles.placeholderText,
                        !shouldEditCategory && styles.disabledText,
                      ]}>
                      {selectedCategory?.name ||
                        t('provider_register.choose_work_field')}
                    </AppText>
                  </TouchableOpacity>

                  {!!categoryError && (
                    <AppText style={styles.errorText}>{categoryError}</AppText>
                  )}
                </View>

                <View style={styles.fieldWrapper}>
                  <View
                    pointerEvents={shouldEditExperience ? 'auto' : 'none'}
                    style={!shouldEditExperience && styles.disabledInputWrapper}>
                    <AppInput
                      label={t('provider_register.experience_years')}
                      placeholder={t(
                        'provider_register.experience_years_placeholder',
                      )}
                      value={experienceYears}
                      onChangeText={handleExperienceChange}
                      onBlur={() =>
                        setExperienceError(validateExperience(experienceYears))
                      }
                      keyboardType="number-pad"
                      maxLength={2}
                      style={styles.inputField}
                    />
                  </View>

                  {!!experienceError && (
                    <AppText style={styles.errorText}>
                      {experienceError}
                    </AppText>
                  )}
                </View>

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

      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={() => setSheetVisible(false)}
          />

          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />

            {categoriesLoading ? (
              <View style={styles.sheetLoading}>
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                data={categoriesGroups}
                keyExtractor={item => String(item.id)}
                renderItem={renderCategoryGroup}
                contentContainerStyle={styles.sheetListContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: Platform.OS === 'ios' ? 120 : 150,
  },

  content: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 70,
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
    width: '60%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F58220',
    alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },

  fieldWrapper: {
    width: '100%',
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
    marginEnd: 5,
    textAlign: 'auto',
  },

  selectBox: {
    width: '100%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  disabledBox: {
    opacity: 0.65,
    backgroundColor: '#F7F7F7',
  },

  disabledText: {
    color: '#555555',
  },

  disabledInputWrapper: {
    opacity: 0.65,
  },

  inputErrorBorder: {
    borderColor: '#FF3B30',
  },

  selectText: {
    flex: 1,
    fontSize: 13,
    color: '#1C1C1C',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginHorizontal: 8,
  },

  placeholderText: {
    color: '#8E8E8E',
  },

  inputField: {
    width: '100%',
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  sheetContainer: {
    width: '100%',
    maxHeight: '86%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginBottom: 18,
  },

  sheetLoading: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetListContent: {
    paddingBottom: 20,
  },

  sheetGroup: {
    width: '100%',
    marginBottom: 18,
  },

  sheetGroupTitle: {
    fontSize: 16,
    color: '#1C1C1C',
    marginBottom: 10,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  categoriesGrid: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  categoryCard: {
    width: '30.5%',
    marginBottom: 16,
    marginHorizontal: '1.4%',
    alignItems: 'center',
  },

  categoryCardActive: {
    opacity: 0.85,
  },

  categoryImageBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  categoryImageBoxActive: {
    borderColor: '#F58220',
    backgroundColor: '#FFF6EE',
  },

  categoryImage: {
    width: 60,
    height: 60,
  },

  categoryName: {
    fontSize: 12,
    color: '#1C1C1C',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default ProviderWorkInfoScreen;