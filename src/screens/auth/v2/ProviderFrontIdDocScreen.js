import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  I18nManager,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  AppState,
  Linking,
  Dimensions,
} from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import {
  compressImageUnderKB,
  buildImageFormFile,
} from '../../../services/imageCompressService';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import AppButton from '../../../component/AppButton';
import AppText from '../../../shared/AppText';
import BackButton from '../../../component/BackButton';
import LoadingModal from '../../../component/LoadingModal';
import {completeProviderStep} from '../../../services/authService';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CARD_WIDTH = Math.min(SCREEN_WIDTH - 64, 330);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.08);
const PREVIEW_HEIGHT = Math.round(CARD_HEIGHT * 0.75);

const REVIEW_IMAGE_WIDTH = Math.min(SCREEN_WIDTH - 105, 250);
const REVIEW_IMAGE_HEIGHT = Math.round(REVIEW_IMAGE_WIDTH * 0.63);

const ACTION_WIDTH = Math.min(SCREEN_WIDTH - 36, 360);
const REVIEW_BUTTONS_WIDTH = Math.min(SCREEN_WIDTH - 70, 300);

const ProviderFrontIdDocScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const cameraRef = useRef(null);
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  const phoneNumber = route.params?.phone || '';

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [appStateKey, setAppStateKey] = useState(0);

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  useEffect(() => {
    requestCameraPermissionIfNeeded();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        setAppStateKey(prev => prev + 1);
      } else {
        setCameraActive(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let timer = null;

    setCameraActive(false);
    setCameraReady(false);

    if (isFocused && hasPermission && device && !reviewMode) {
      timer = setTimeout(() => {
        setCameraActive(true);
      }, 450);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      setCameraActive(false);
    };
  }, [isFocused, hasPermission, device, reviewMode, appStateKey]);

  const requestCameraPermissionIfNeeded = async () => {
    try {
      setErrorText('');

      if (hasPermission) {
        return;
      }

      const granted = await requestPermission();

      if (!granted) {
        setErrorText(
          tr(
            'provider_register.camera_permission_required',
            'من فضلك فعّل صلاحية الكاميرا من إعدادات التطبيق',
          ),
        );
      }
    } catch (error) {
      console.log('CAMERA PERMISSION ERROR:', error);

      setErrorText(
        tr('provider_register.camera_open_failed', 'تعذر فتح الكاميرا'),
      );
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
  };

  const normalizeFileUri = uri => {
    if (!uri) {
      return '';
    }

    return uri.startsWith('file://') ? uri : `file://${uri}`;
  };

  const getImageSize = uri => {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => {
          resolve({width, height});
        },
        error => {
          reject(error);
        },
      );
    });
  };

  const cropImageToScanFrame = async originalUri => {
    const safeUri = normalizeFileUri(originalUri);
    const {width: imageWidth, height: imageHeight} = await getImageSize(safeUri);

    const previewWidth = CARD_WIDTH;
    const previewHeight = PREVIEW_HEIGHT;

    /*
     * نفس أبعاد ومكان الإطار الأزرق بالضبط من styles.scanFrame
     */
    const frameX = Math.round(CARD_WIDTH * 0.1);
    const frameY = Math.round(PREVIEW_HEIGHT * 0.2);
    const frameWidth = Math.round(CARD_WIDTH * 0.8);
    const frameHeight = Math.round(PREVIEW_HEIGHT * 0.65);

    /*
     * هامش بسيط حوالين الإطار عشان ما نقصش البطاقة من الحواف
     * زوده لـ 0.12 لو عايز مساحة أكبر حوالين البطاقة
     */
    const extraPaddingX = Math.round(frameWidth * 0.1);
    const extraPaddingY = Math.round(frameHeight * 0.1);

    const targetX = frameX - extraPaddingX;
    const targetY = frameY - extraPaddingY;
    const targetWidth = frameWidth + extraPaddingX * 2;
    const targetHeight = frameHeight + extraPaddingY * 2;

    /*
     * الكاميرا عندك resizeMode="cover"، فجزء من الصورة بيبقى خارج المعروض.
     * هنا بنحوّل إحداثيات الإطار من شاشة الموبايل إلى الصورة الأصلية.
     */
    const scale = Math.max(
      previewWidth / imageWidth,
      previewHeight / imageHeight,
    );

    const displayedImageWidth = imageWidth * scale;
    const displayedImageHeight = imageHeight * scale;

    const hiddenX = Math.max(0, (displayedImageWidth - previewWidth) / 2);
    const hiddenY = Math.max(0, (displayedImageHeight - previewHeight) / 2);

    const cropX = clamp((targetX + hiddenX) / scale, 0, imageWidth - 1);
    const cropY = clamp((targetY + hiddenY) / scale, 0, imageHeight - 1);

    const cropWidth = clamp(targetWidth / scale, 1, imageWidth - cropX);
    const cropHeight = clamp(targetHeight / scale, 1, imageHeight - cropY);

    console.log('FRONT ID CROP DEBUG:', {
      imageWidth,
      imageHeight,
      previewWidth,
      previewHeight,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
      cropX: Math.round(cropX),
      cropY: Math.round(cropY),
      cropWidth: Math.round(cropWidth),
      cropHeight: Math.round(cropHeight),
    });

    const result = await ImageEditor.cropImage(safeUri, {
      offset: {
        x: Math.round(cropX),
        y: Math.round(cropY),
      },
      size: {
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
      },
      displaySize: {
        width: 900,
        height: 650,
      },
      resizeMode: 'contain',
    });

    const croppedUri = typeof result === 'string' ? result : result?.uri;

    if (!croppedUri) {
      throw new Error('crop_failed');
    }

    return normalizeFileUri(croppedUri);
  };

  const takePhoto = async () => {
    if (!cameraRef.current || takingPhoto || !hasPermission || !device) {
      return;
    }

    try {
      setTakingPhoto(true);
      setErrorText('');

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      if (!photo?.path) {
        setErrorText(
          tr('provider_register.id_capture_failed', 'تعذر التقاط الصورة'),
        );
        return;
      }

      const originalUri = normalizeFileUri(photo.path);

      /*
       * قص الصورة حسب الإطار الأزرق قبل الضغط والرفع
       */
      const croppedUri = await cropImageToScanFrame(originalUri);

      /*
       * ضغط الصورة المقصوصة فقط
       */
      const compressedImage = await compressImageUnderKB({
        uri: croppedUri,
        maxKB: 60,
        maxWidth: 900,
        maxHeight: 650,
        filePrefix: 'front_id_doc',
      });

      if (!compressedImage?.uri) {
        setErrorText(
          tr('provider_register.id_capture_failed', 'تعذر معالجة الصورة'),
        );
        return;
      }

      setCapturedImage({
        uri: compressedImage.uri,
        sizeKB: compressedImage.sizeKB,
        file: buildImageFormFile(compressedImage),
      });

      setReviewMode(true);
      setCameraActive(false);
    } catch (error) {
      console.log('TAKE FRONT ID PHOTO ERROR:', error);

      setErrorText(
        error?.message ||
          tr('provider_register.id_capture_failed', 'تعذر التقاط الصورة'),
      );
    } finally {
      setTakingPhoto(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setReviewMode(false);
    setErrorText('');
    setCameraReady(false);
  };

  const handleConfirm = async () => {
    if (!capturedImage?.file) {
      setErrorText(
        tr('provider_register.front_id_required', 'من فضلك التقط صورة البطاقة'),
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
        step: 'front_id_doc',
        phone: phoneNumber,
        frontIdDoc: capturedImage.file,
      });

      navigation.replace('ProviderRearIdDocScreen', {
        phone: response?.phone || phoneNumber,
        missingFields: response?.missing_fields || [],
        existingData: response?.existing_data || {},
        user: response?.user || {},
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

  const renderCameraBox = () => {
    if (!hasPermission) {
      return (
        <View style={styles.cameraFallback}>
          <Ionicons name="camera-outline" size={34} color="#FFFFFF" />

          <AppText style={styles.cameraFallbackText}>
            {tr(
              'provider_register.camera_permission_required',
              'من فضلك امنح صلاحية الكاميرا',
            )}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.permissionButton}
            onPress={requestCameraPermissionIfNeeded}>
            <AppText weight="bold" style={styles.permissionButtonText}>
              {tr('provider_register.allow_camera', 'السماح بالكاميرا')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.settingsButton}
            onPress={handleOpenSettings}>
            <AppText style={styles.settingsButtonText}>
              {tr('provider_register.open_settings', 'فتح الإعدادات')}
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.cameraFallback}>
          <ActivityIndicator color="#FFFFFF" />

          <AppText style={styles.cameraFallbackText}>
            {tr('provider_register.camera_loading', 'جاري فتح الكاميرا...')}
          </AppText>
        </View>
      );
    }

    return (
      <>
        <View style={styles.previewArea}>
          <Camera
            ref={cameraRef}
            style={styles.cameraPreview}
            device={device}
            isActive={cameraActive}
            photo={true}
            preview={true}
            resizeMode="cover"
            androidPreviewViewType="texture-view"
            onInitialized={() => {
              console.log('FRONT ID CAMERA INITIALIZED');
              setCameraReady(true);
              setErrorText('');
            }}
            onStarted={() => {
              console.log('FRONT ID CAMERA STARTED');
              setCameraReady(true);
              setErrorText('');
            }}
            onStopped={() => {
              console.log('FRONT ID CAMERA STOPPED');
            }}
            onError={error => {
              console.log('FRONT ID CAMERA ERROR:', error);
              setCameraReady(false);

              setErrorText(
                error?.message ||
                  tr(
                    'provider_register.camera_open_failed',
                    'تعذر فتح الكاميرا',
                  ),
              );
            }}
          />

          {!cameraReady && (
            <View pointerEvents="none" style={styles.cameraLoadingOverlay}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}

          <View pointerEvents="none" style={styles.scanFrame}>
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionRow}>
            <Ionicons name="checkmark" size={15} color="#3498db" />
            <AppText style={styles.instructionText}>
              {tr('provider_register.id_rule_1', 'ضع البطاقة داخل الإطار')}
            </AppText>
          </View>

          <View style={styles.instructionRow}>
            <Ionicons name="checkmark" size={15} color="#3498db" />
            <AppText style={styles.instructionText}>
              {tr('provider_register.id_rule_2', 'تأكد من وضوح الصورة')}
            </AppText>
          </View>

          <View style={[styles.instructionRow, styles.lastInstructionRow]}>
            <Ionicons name="checkmark" size={15} color="#3498db" />
            <AppText style={styles.instructionText}>
              {tr('provider_register.id_rule_3', 'تجنب الظلال واللمعان')}
            </AppText>
          </View>
        </View>
      </>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <AppText weight="bold" style={styles.title}>
          {tr('provider_register.verify_identity_title', 'توثيق الهوية')}
        </AppText>

        <AppText style={styles.subtitle}>
          {tr(
            'provider_register.verify_identity_subtitle',
            'قم بتصوير الوجه الأمامي لبطاقتك الشخصية للتأكد من هويتك وضمان أمان الخدمة.',
          )}
        </AppText>

        <View style={styles.progressTrack}>
          <View style={styles.progressActive} />
        </View>
      </View>
    );
  };

  const renderCaptureView = () => {
    return (
      <View style={styles.screenBody}>
        {renderHeader()}

        <View style={styles.cameraCard}>{renderCameraBox()}</View>

        {!!errorText && <AppText style={styles.errorText}>{errorText}</AppText>}

        <AppButton
          title={
            takingPhoto
              ? tr('provider_register.capturing', 'جاري الالتقاط...')
              : tr('provider_register.capture_id_photo', 'التقاط صورة البطاقة')
          }
          onPress={takePhoto}
          style={styles.captureButton}
          disabled={!hasPermission || !device || takingPhoto}
        />
      </View>
    );
  };

  const renderReviewView = () => {
    return (
      <View style={styles.reviewBody}>
        <View style={styles.reviewHeader}>
          <AppText weight="bold" style={styles.reviewTitle}>
            {tr('provider_register.review_photo_title', 'مراجعة الصورة')}
          </AppText>

          <AppText style={styles.reviewSubtitle}>
            {tr(
              'provider_register.review_photo_subtitle',
              'تأكد أن جميع البيانات واضحة ومقروءة قبل الإرسال.',
            )}
          </AppText>
        </View>

        <View style={styles.reviewImageBox}>
          <Image
            source={{uri: capturedImage?.uri}}
            style={styles.reviewImage}
            resizeMode="cover"
          />
        </View>

        {!!errorText && (
          <AppText style={styles.reviewErrorText}>{errorText}</AppText>
        )}

        <View style={styles.reviewButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.confirmButton}
            onPress={handleConfirm}>
            <AppText weight="bold" style={styles.confirmButtonText}>
              {tr('provider_register.confirm', 'تأكيد')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.retakeButton}
            onPress={handleRetake}>
            <AppText weight="bold" style={styles.retakeButtonText}>
              {tr('provider_register.retake_photo', 'إعادة تصوير')}
            </AppText>
          </TouchableOpacity>
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
        locations={[0, 0.36]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <BackButton
          onPress={() => {
            if (reviewMode) {
              handleRetake();
            } else {
              navigation.goBack();
            }
          }}
        />

        <View style={styles.content}>
          {reviewMode ? renderReviewView() : renderCaptureView()}
        </View>
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

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  screenBody: {
    width: '100%',
    alignItems: 'center',
  },

  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    color: '#171717',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 12.2,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 20,
    width: '86%',
  },

  progressTrack: {
    width: ACTION_WIDTH,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    overflow: 'hidden',
    marginTop: 18,
    position: 'relative',
  },

  progressActive: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    borderRadius: 10,
    backgroundColor: '#F58220',
  },

  cameraCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#6B6262',
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },

  previewArea: {
    position: 'absolute',
    top: 0,
    end: 0,
    start: 0,
    height: PREVIEW_HEIGHT,
    backgroundColor: '#6B6262',
    overflow: 'hidden',
  },

  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },

  cameraLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6B6262',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanFrame: {
    position: 'absolute',
    top: Math.round(PREVIEW_HEIGHT * 0.2),
    end: Math.round(CARD_WIDTH * 0.1),
    start: Math.round(CARD_WIDTH * 0.1),
    height: Math.round(PREVIEW_HEIGHT * 0.65),
  },

  corner: {
    position: 'absolute',
    width: 23,
    height: 23,
    borderColor: '#2EA5FF',
  },

  topLeft: {
    top: 0,
    end: 0,
    borderTopWidth: 3,
    borderEndWidth: 3,
    borderTopEndRadius: 5,
  },

  topRight: {
    top: 0,
    start: 0,
    borderTopWidth: 3,
    borderStartWidth: 3,
    borderTopStartRadius: 5,
  },

  bottomLeft: {
    bottom: 0,
    end: 0,
    borderBottomWidth: 3,
    borderEndWidth: 3,
    borderBottomEndRadius: 5,
  },

  bottomRight: {
    bottom: 0,
    start: 0,
    borderBottomWidth: 3,
    borderStartWidth: 3,
    borderBottomStartRadius: 5,
  },

  instructionsCard: {
    position: 'absolute',
    end: 12,
    start: 12,
    bottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 13,
    paddingBottom: 11,
    paddingHorizontal: 15,
  },

  instructionRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    marginBottom: 7,
  },

  lastInstructionRow: {
    marginBottom: 0,
  },

  instructionText: {
    flex: 1,
    fontSize: 10.5,
    color: '#333333',
    marginHorizontal: 6,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    lineHeight: 17,
  },

  cameraFallback: {
    flex: 1,
    width: '100%',
    backgroundColor: '#6B6262',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  cameraFallbackText: {
    fontSize: 11.5,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },

  permissionButton: {
    minWidth: 116,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    marginTop: 14,
  },

  permissionButtonText: {
    fontSize: 11.5,
    color: '#FFFFFF',
  },

  settingsButton: {
    marginTop: 9,
  },

  settingsButtonText: {
    fontSize: 10.5,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  captureButton: {
    width: ACTION_WIDTH,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#3498db',
  },

  errorText: {
    width: ACTION_WIDTH,
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  reviewBody: {
    width: '100%',
    alignItems: 'center',
  },

  reviewHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 26,
  },

  reviewTitle: {
    fontSize: 24,
    color: '#171717',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 32,
  },

  reviewSubtitle: {
    fontSize: 12.2,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 20,
    width: '86%',
  },

  reviewImageBox: {
    width: REVIEW_IMAGE_WIDTH,
    height: REVIEW_IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 7,
        shadowOffset: {width: 0, height: 3},
      },
      android: {
        elevation: 2,
      },
    }),
  },

  reviewImage: {
    width: '100%',
    height: '100%',
  },

  reviewButtonsRow: {
    width: REVIEW_BUTTONS_WIDTH,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: I18nManager.isRTL ? 0 : 7,
    marginStart: I18nManager.isRTL ? 7 : 0,
  },

  retakeButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: I18nManager.isRTL ? 0 : 7,
    marginEnd: I18nManager.isRTL ? 7 : 0,
  },

  confirmButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
  },

  retakeButtonText: {
    fontSize: 13,
    color: '#3498db',
  },

  reviewErrorText: {
    width: REVIEW_BUTTONS_WIDTH,
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 12,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
});

export default ProviderFrontIdDocScreen; 