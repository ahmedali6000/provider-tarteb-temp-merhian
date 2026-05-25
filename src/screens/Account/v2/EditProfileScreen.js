import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  I18nManager,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import ImagePicker from 'react-native-image-crop-picker';

import AppText from '../../../shared/AppText';
import AppButton from '../../../component/AppButton';
import useAppFont from '../../../hooks/useAppFont';
import AppHeader from '../../../shared/AppHeader';

import {setUser} from '../../../redux/actions';
import {UPLOAD_IMAGE_REG} from '../../../redux/actions/ActionTypes';
import {updateProviderProfile} from '../../../services/providerProfileService';

const DEFAULT_AVATAR = 'https://tarteb.app/boy.png';

const EditProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth.user);
  const user_image = useSelector(state => state.auth.user_image);

  const isRTL = I18nManager.isRTL;

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [experienceYears, setExperienceYears] = useState(
    user?.experience_years !== undefined && user?.experience_years !== null
      ? String(user.experience_years)
      : '',
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const phone = user?.phone ? String(user.phone) : '';
  const nationalId = user?.national_id ? String(user.national_id) : '';

  const categoryName =
    user?.category?.name ||
    user?.category_name ||
    user?.provider_category_name ||
    user?.categoryName ||
    '';

  const avatarUri = useMemo(() => {
    if (selectedImage?.path) {
      return selectedImage.path;
    }

    return (
      user_image ||
      user?.profile_photo_path ||
      user?.image ||
      user?.image_url ||
      DEFAULT_AVATAR
    );
  }, [selectedImage, user_image, user]);

  const validateForm = () => {
    if (!fullName || fullName.trim().length < 2) {
      Alert.alert(
        tr('common.alert', 'تنبيه'),
        tr('edit_profile.name_required', 'من فضلك اكتب الاسم بشكل صحيح'),
      );
      return false;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert(
        tr('common.alert', 'تنبيه'),
        tr('edit_profile.email_invalid', 'من فضلك اكتب بريد إلكتروني صحيح'),
      );
      return false;
    }

    if (
      experienceYears &&
      Number.isNaN(Number(experienceYears))
    ) {
      Alert.alert(
        tr('common.alert', 'تنبيه'),
        tr('edit_profile.experience_invalid', 'من فضلك اكتب عدد سنوات الخبرة بشكل صحيح'),
      );
      return false;
    }

    return true;
  };

  const onPressEditImage = async () => {
    if (pickingImage) {
      return;
    }

    try {
      setPickingImage(true);

      const pickedImage = await ImagePicker.openPicker({
        mediaType: 'photo',
        includeBase64: false,
        forceJpg: true,
      });

      if (!pickedImage?.path) {
        return;
      }

      const croppedImage = await ImagePicker.openCropper({
        path: pickedImage.path,
        width: 400,
        height: 400,
        cropping: true,
        compressImageQuality: 0.75,
        includeBase64: true,
        forceJpg: true,
        avoidEmptySpaceAroundImage: true,
      });

      if (!croppedImage?.path) {
        return;
      }

      setSelectedImage(croppedImage);
      setImageBase64(croppedImage?.data || null);
    } catch (error) {
      console.log('IMAGE PICKER ERROR:', error);

      if (
        error?.code === 'E_PICKER_CANCELLED' ||
        error?.message?.toLowerCase?.().includes('cancel')
      ) {
        return;
      }

      Alert.alert(
        tr('common.error', 'خطأ'),
        tr('edit_profile.image_error', 'حدث خطأ أثناء اختيار الصورة'),
      );
    } finally {
      setTimeout(() => {
        setPickingImage(false);
      }, 500);
    }
  };

  const onPressSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: fullName.trim(),
        email: email ? email.trim() : null,
        experience_years: experienceYears ? Number(experienceYears) : 0,
      };

      if (imageBase64) {
        payload.image_base_64 = `data:image/jpeg;base64,${imageBase64}`;
      }

      const result = await updateProviderProfile(payload);

      if (result?.status === true) {
        if (result?.data?.user) {
          dispatch(setUser(result.data.user));
        }

        if (result?.data?.image_url) {
          dispatch({
            type: UPLOAD_IMAGE_REG,
            payload: result.data.image_url,
          });
        }

        Alert.alert(
          tr('common.success', 'تم بنجاح'),
          result?.message ||
            tr('edit_profile.updated_successfully', 'تم تحديث البيانات بنجاح'),
          [
            {
              text: tr('common.ok', 'حسناً'),
              onPress: () => navigation.goBack(),
            },
          ],
        );

        return;
      }

      Alert.alert(
        tr('common.alert', 'تنبيه'),
        result?.message ||
          tr('edit_profile.update_failed', 'تعذر تحديث البيانات'),
      );
    } catch (error) {
      console.log(
        'UPDATE PROVIDER PROFILE ERROR:',
        error?.response?.data || error?.message,
      );

      Alert.alert(
        tr('common.error', 'خطأ'),
        error?.response?.data?.message ||
          tr('edit_profile.update_failed', 'تعذر تحديث البيانات'),
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    editable = true,
    keyboardType = 'default',
  }) => {
    return (
      <View style={styles.fieldWrap}>
        <AppText style={styles.label}>{label}</AppText>

        <View style={[styles.inputWrapper, !editable && styles.disabledWrapper]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            selectTextOnFocus={editable}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            keyboardType={keyboardType}
            style={[
              styles.input,
              !editable && styles.disabledInput,
              {
                fontFamily,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />

          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={editable ? '#2B2B2B' : '#777'}
              style={styles.inputIcon}
            />
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <AppHeader
            titleKey="edit_profile.title"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{uri: avatarUri}} style={styles.avatarImage} />

              <TouchableOpacity
                onPress={onPressEditImage}
                disabled={pickingImage}
                style={styles.editAvatarButton}
                activeOpacity={0.85}>
                <Ionicons name="camera-outline" size={19} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <AppText weight="bold" style={styles.sectionTitle}>
            {tr('edit_profile.personal_data', 'بيانات شخصية')}
          </AppText>

          {renderInput({
            label: tr('edit_profile.full_name', 'الاسم بالكامل'),
            value: fullName,
            onChangeText: setFullName,
            placeholder: tr('edit_profile.full_name_placeholder', 'اكتب اسمك'),
            icon: 'person-outline',
          })}

          {renderInput({
            label: tr('edit_profile.national_id', 'الرقم القومي'),
            value: nationalId,
            placeholder: tr('edit_profile.national_id', 'الرقم القومي'),
            icon: 'card-outline',
            editable: false,
            keyboardType: 'number-pad',
          })}

          <AppText weight="bold" style={styles.sectionTitle}>
            {tr('edit_profile.work_data', 'بيانات العمل')}
          </AppText>

          {renderInput({
            label: tr('edit_profile.work_field', 'مجال العمل'),
            value: categoryName,
            placeholder: tr('edit_profile.work_field', 'مجال العمل'),
            icon: 'chevron-down-outline',
            editable: false,
          })}

          {renderInput({
            label: tr('edit_profile.experience_years', 'عدد سنوات الخبرة'),
            value: experienceYears,
            onChangeText: setExperienceYears,
            placeholder: tr('edit_profile.experience_years_placeholder', 'عدد سنوات الخبرة'),
            keyboardType: 'number-pad',
          })}

          <AppText weight="bold" style={styles.sectionTitle}>
            {tr('edit_profile.account_data', 'بيانات الحساب')}
          </AppText>

          {renderInput({
            label: tr('edit_profile.phone', 'رقم الهاتف'),
            value: phone,
            placeholder: tr('edit_profile.phone_placeholder', 'رقم الهاتف'),
            icon: 'call-outline',
            editable: false,
            keyboardType: 'phone-pad',
          })}

          {renderInput({
            label: tr('edit_profile.email', 'البريد الإلكتروني'),
            value: email,
            onChangeText: setEmail,
            placeholder: tr('edit_profile.email_placeholder', 'example@email.com'),
            icon: 'mail-outline',
            keyboardType: 'email-address',
          })}
        </ScrollView>

        <View style={styles.bottomButtonWrap}>
          {loading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <AppButton
              title={tr('edit_profile.save_changes', 'حفظ التغييرات')}
              onPress={onPressSave}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 18,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 4},
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ddd',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3E97D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F4F4',
  },
  sectionTitle: {
    fontSize: 15,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginTop: 12,
    marginBottom: 8,
  },
  fieldWrap: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#2A2A2A',
    textAlign: 'auto',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  disabledWrapper: {
    backgroundColor: '#F1F1F1',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F1F1F',
    paddingVertical: 0,
  },
  disabledInput: {
    color: '#333333',
  },
  inputIcon: {
    marginLeft: 8,
  },
  bottomButtonWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'transparent',
  },
  loadingButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});