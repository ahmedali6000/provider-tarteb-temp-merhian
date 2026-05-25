import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  I18nManager,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import {useTranslation} from 'react-i18next';

import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import BackButton from '../../../component/BackButton';
import LoadingModal from '../../../component/LoadingModal';
import {completeProviderStep} from '../../../services/authService';

const ProviderProfilePhotoScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const phoneNumber = route.params?.phone || '';

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [errorText, setErrorText] = useState('');

  const isFormValid = !!photo?.file;

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const onPressPickImage = async () => {
    if (pickingImage) {
      return;
    }

    try {
      setPickingImage(true);
      setErrorText('');

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
        width: 500,
        height: 500,
        cropping: true,
        compressImageQuality: 0.75,
        includeBase64: false,
        forceJpg: true,
        avoidEmptySpaceAroundImage: true,
      });

      if (!croppedImage?.path) {
        return;
      }

      setPhoto({
        uri: croppedImage.path,
        file: {
          uri: croppedImage.path,
          type: croppedImage.mime || 'image/jpeg',
          name: `provider_profile_${Date.now()}.jpg`,
        },
      });
    } catch (error) {
      console.log('PROFILE PHOTO PICKER ERROR:', error);

      if (
        error?.code === 'E_PICKER_CANCELLED' ||
        error?.message?.toLowerCase?.().includes('cancel')
      ) {
        return;
      }

      setErrorText(
        tr(
          'provider_register.profile_photo_pick_failed',
          'تعذر اختيار الصورة',
        ),
      );
    } finally {
      setTimeout(() => {
        setPickingImage(false);
      }, 500);
    }
  };

  const handleContinue = async () => {
    if (!photo?.file) {
      setErrorText(
        tr(
          'provider_register.profile_photo_required',
          'من فضلك ارفع صورة شخصية',
        ),
      );
      return;
    }

    if (!phoneNumber) {
      setErrorText(tr('login.phone_required', 'رقم الهاتف مطلوب'));
      return;
    }

    setLoading(true);
    setErrorText('');

    try {
      const response = await completeProviderStep({
        step: 'profile_photo',
        phone: phoneNumber,
        profilePhoto: photo.file,
      });

      navigation.replace('ProviderFrontIdDocScreen', {
        phone: response?.phone || phoneNumber,
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        tr('login.otp_request_failed', 'حدث خطأ، حاول مرة أخرى');

      setErrorText(errorMessage);
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

        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.title}>
              {tr('provider_register.profile_photo_title', 'أضف صورة شخصية')}
            </AppText>

            <AppText style={styles.subtitle}>
              {tr(
                'provider_register.profile_photo_subtitle',
                'استخدم صورة واضحة لزيادة ثقة العملاء بك',
              )}
            </AppText>

            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.photoWrapper}
            onPress={onPressPickImage}
            disabled={pickingImage}>
            {photo?.uri ? (
              <>
                <Image
                  source={{uri: photo.uri}}
                  style={styles.profileImage}
                  resizeMode="cover"
                />

                <View style={styles.editButton}>
                  <Ionicons name="pencil-outline" size={22} color="#FFFFFF" />
                </View>
              </>
            ) : (
              <View style={styles.emptyPhoto}>
                {pickingImage ? (
                  <AppText style={styles.uploadText}>
                    {tr('provider_register.loading', 'جاري التحميل...')}
                  </AppText>
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={28}
                      color="#1C1C1C"
                    />

                    <AppText weight="bold" style={styles.uploadText}>
                      {tr('provider_register.upload_photo', 'رفع صورة')}
                    </AppText>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>

          {!!errorText && (
            <AppText style={styles.errorText}>
              {errorText}
            </AppText>
          )}

          <AppButton
            title={tr('provider_register.continue', 'متابعة')}
            onPress={handleContinue}
            style={[
              styles.continueButton,
              (!isFormValid || pickingImage) && styles.disabledButton,
            ]}
            textStyle={
              !isFormValid || pickingImage ? styles.disabledButtonText : {}
            }
            disabled={!isFormValid || pickingImage}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const IMAGE_SIZE = 148;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
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
    width: '80%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F58220',
    alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },

  photoWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    marginBottom: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyPhoto: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadText: {
    fontSize: 12,
    color: '#1C1C1C',
    marginTop: 8,
    textAlign: 'center',
  },

  profileImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: '#F2F2F2',
  },

  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 3},
      },
      android: {
        elevation: 3,
      },
    }),
  },

  errorText: {
    width: '100%',
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  continueButton: {
    width: '100%',
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

export default ProviderProfilePhotoScreen;