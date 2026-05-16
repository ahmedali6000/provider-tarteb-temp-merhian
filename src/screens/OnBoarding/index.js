import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  I18nManager,
} from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import RNRestart from 'react-native-restart';

import styles from './style';
import AppText from '../../shared/AppText';
import AppButton from '../../component/AppButton';

import {OnBoarding_KEY, Language_KEY} from '../../utils/app';
import {APP_VISITED_CHANGE} from '../../redux/actions/ActionTypes';

function OnBoarding() {
  const sliderRef = useRef(null);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const {t, i18n} = useTranslation();

  /*
   * مهم:
   * نعتمد على اللغة المختارة، مش I18nManager.
   * لأن قبل Restart التطبيق Native لسه ممكن يكون LTR.
   */
  const isArabic = i18n.language === 'ar';

  const [activeIndex, setActiveIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const slides = useMemo(
    () => [
      {
        key: '1',
        title: t('onboarding.title1'),
        text: t('onboarding.desc1'),
        image: require('../../../assets/app/images/onboarding/1.png'),
      },
      {
        key: '2',
        title: t('onboarding.title2'),
        text: t('onboarding.desc2'),
        image: require('../../../assets/app/images/onboarding/2.png'),
      },
      {
        key: '3',
        title: t('onboarding.title3'),
        text: t('onboarding.desc3'),
        image: require('../../../assets/app/images/onboarding/3.png'),
      },
    ],
    [t],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex(0);
      sliderRef.current?.goToSlide(0, false);
    }, 80);

    return () => clearTimeout(timer);
  }, [i18n.language]);

  const onDone = useCallback(async () => {
    if (finishing) {
      return;
    }

    try {
      setFinishing(true);

      await AsyncStorage.setItem(OnBoarding_KEY, 'visited_before');

      dispatch({
        type: APP_VISITED_CHANGE,
        payload: 'visited_before',
      });

      const savedLang = await AsyncStorage.getItem(Language_KEY);
      const finalLang = savedLang || i18n.language || 'en';
      const shouldBeRTL = finalLang === 'ar';

      /*
       * هنا فقط نطبق RTL الحقيقي.
       * يعني بعد انتهاء OnBoarding.
       */
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      RNRestart.Restart();
    } catch (error) {
      console.log('ONBOARDING DONE ERROR:', error);
      navigation.replace('LoginScreen');
    }
  }, [dispatch, finishing, i18n.language, navigation]);

  const goNext = useCallback(
    (item, index) => {
      if (finishing) {
        return;
      }

      const isLastSlide = index >= slides.length - 1 || item.key === '3';

      if (isLastSlide) {
        onDone();
        return;
      }

      const nextIndex = index + 1;

      setActiveIndex(nextIndex);
      sliderRef.current?.goToSlide(nextIndex, true);
    },
    [finishing, onDone, slides.length],
  );

  const renderItem = useCallback(
    ({item, index}) => {
      const isLastSlide = index >= slides.length - 1 || item.key === '3';

      return (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          <ImageBackground
            source={item.image}
            style={styles.bg}
            resizeMode="cover">
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={finishing}
              style={[
                styles.skip,
                {
                  top: insets.top + 10,

                  /*
                   * العربي: زر تخطي يمين
                   * الإنجليزي: زر تخطي شمال
                   */
                  right: isArabic ? 20 : undefined,
                  left: isArabic ? undefined : 20,
                },
              ]}
              onPress={onDone}>
              <AppText
                weight="bold"
                style={[
                  styles.skipText,
                  {
                    textAlign: isArabic ? 'right' : 'left',
                    writingDirection: isArabic ? 'rtl' : 'ltr',
                  },
                ]}>
                {t('skip')}
              </AppText>
            </TouchableOpacity>

            <LinearGradient
              locations={[0, 0.6]}
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.gradient}
            />

            <View
              style={[
                styles.content,
                {
                  /*
                   * العربي: المحتوى ناحية اليمين
                   * الإنجليزي: المحتوى ناحية الشمال
                   */
                  alignItems: isArabic ? 'flex-end' : 'flex-start',
                },
              ]}>
              <AppText
                weight="bold"
                style={[
                  styles.title,
                  {
                    textAlign: isArabic ? 'right' : 'left',
                    writingDirection: isArabic ? 'rtl' : 'ltr',
                    alignSelf: isArabic ? 'flex-end' : 'flex-start',
                  },
                ]}>
                {item.title}
              </AppText>

              <AppText
                style={[
                  styles.desc,
                  {
                    textAlign: isArabic ? 'right' : 'left',
                    writingDirection: isArabic ? 'rtl' : 'ltr',
                    alignSelf: isArabic ? 'flex-end' : 'flex-start',
                  },
                ]}>
                {item.text}
              </AppText>

              <View
                style={{
                  width: '100%',
                  alignItems: isArabic ? 'flex-end' : 'flex-start',
                }}>
                <AppButton
                  title={
                    finishing
                      ? '...'
                      : isLastSlide
                      ? t('start_now')
                      : t('next')
                  }
                  disabled={finishing}
                  onPress={() => goNext(item, index)}
                />
              </View>
            </View>
          </ImageBackground>
        </View>
      );
    },
    [
      finishing,
      goNext,
      insets.top,
      isArabic,
      onDone,
      slides.length,
      t,
    ],
  );

  return (
    <AppIntroSlider
      key={`onboarding-${i18n.language}`}
      ref={sliderRef}
      data={slides}
      renderItem={renderItem}
      showNextButton={false}
      showDoneButton={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      inverted={false}
      extraData={{
        activeIndex,
        finishing,
        language: i18n.language,
      }}
      onSlideChange={index => {
        setActiveIndex(index);
      }}
    />
  );
}

export default OnBoarding;