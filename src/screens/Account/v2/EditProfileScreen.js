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
import api from '../../../services/api';

import {setUser} from '../../../redux/actions';
import {UPLOAD_IMAGE_REG} from '../../../redux/actions/ActionTypes';

const DEFAULT_AVATAR = 'https://tarteb.app/boy.png';

const EditProfileScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth.user);
  const user_image = useSelector(state => state.auth.user_image);

  const isRTL = I18nManager.isRTL;

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone] = useState(user?.phone ? String(user.phone) : '');
  const [email, setEmail] = useState(user?.email || '');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

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

    return true;
  };

const [pickingImage, setPickingImage] = useState(false);

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
      };

      if (imageBase64) {
        payload.image_base_64 = `data:image/jpeg;base64,${imageBase64}`;
      }

      const response = await api.post('/profile/update', payload);

      const result = response.data;

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
        'UPDATE PROFILE ERROR:',
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

            <AppText style={styles.avatarHint}>
              {tr('edit_profile.change_photo', 'تغيير الصورة الشخصية')}
            </AppText>
          </View>

          <View style={styles.formSection}>
            <View style={styles.newWrapperLabel}>
              <AppText style={styles.label}>
                {tr('edit_profile.full_name', 'الاسم بالكامل')}
              </AppText>

              <View style={styles.inputWrapper}>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={tr(
                    'edit_profile.full_name_placeholder',
                    'اكتب اسمك',
                  )}
                  placeholderTextColor="#A0A0A0"
                  style={[
                    styles.input,
                    {
                      fontFamily,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />

                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#2B2B2B"
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.newWrapperLabel}>
              <AppText style={styles.label}>
                {tr('edit_profile.phone', 'رقم الهاتف')}
              </AppText>

              <View style={styles.phoneWrapperDisabled}>
                <TextInput
                  value={phone}
                  editable={false}
                  selectTextOnFocus={false}
                  placeholder={tr(
                    'edit_profile.phone_placeholder',
                    'رقم الهاتف',
                  )}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  style={[
                    styles.phoneInputDisabled,
                    {
                      fontFamily,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />

                <View style={styles.verifiedBox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color="#38B86B"
                  />
                  <AppText style={styles.verifiedText}>
                    {tr('edit_profile.verified', 'موثق')}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.newWrapperLabel}>
              <AppText style={styles.label}>
                {tr('edit_profile.email', 'البريد الإلكتروني')}
              </AppText>

              <View style={styles.inputWrapper}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={tr(
                    'edit_profile.email_placeholder',
                    'example@email.com',
                  )}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    {
                      fontFamily,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                />

                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#2B2B2B"
                  style={styles.inputIcon}
                />
              </View>
            </View>
          </View>
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
    marginTop: 24,
    marginBottom: 22,
  },

  avatarWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 6,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3E97D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F4F4',
  },

  avatarHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#707070',
    textAlign: 'center',
  },

  formSection: {
    marginTop: 4,
  },

  label: {
    fontSize: 15,
    color: '#2A2A2A',
    textAlign: 'auto',
    marginBottom: 8,
    marginTop: 10,
  },

  newWrapperLabel: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginTop: 10,
  },

  inputWrapper: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F1F1F',
    paddingVertical: 0,
  },

  inputIcon: {
    marginLeft: 10,
  },

  phoneWrapperDisabled: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 14,
    backgroundColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  phoneInputDisabled: {
    flex: 1,
    fontSize: 16,
    color: '#7B7B7B',
    paddingVertical: 0,
  },

  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 8,
  },

  verifiedText: {
    fontSize: 12,
    color: '#38B86B',
    marginStart: 4,
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