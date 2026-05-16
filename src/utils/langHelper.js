// src/utils/langHelper.js

import {I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import {Language_KEY} from './app';

export const isArabicLang = lang => lang === 'ar';

export const getTextDirection = lang => {
  const isRTL = isArabicLang(lang);

  return {
    isRTL,
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  };
};

export const applyAppLanguage = async (lang, i18n, shouldRestart = true) => {
  const isRTL = isArabicLang(lang);

  await AsyncStorage.setItem(Language_KEY, lang);
  await i18n.changeLanguage(lang);

  const needRestart = I18nManager.isRTL !== isRTL;

  if (needRestart) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    if (shouldRestart) {
      RNRestart.Restart();
      return true;
    }
  }

  return false;
};