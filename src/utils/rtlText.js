import {I18nManager, Platform} from 'react-native';

export const isArabicLang = language => {
  return String(language || '').toLowerCase().startsWith('ar');
};

export const getAutoTextAlign = language => {
  const isArabic = isArabicLang(language);

  /*
   * الطبيعي:
   * العربي يمين
   * الإنجليزي شمال
   *
   * لكن عندك على iOS لما التطبيق يكون forceRTL شغال،
   * textAlign: 'left' هو اللي بيظهر بصريًا يمين.
   */
  if (isArabic) {
    if (Platform.OS === 'ios' && I18nManager.isRTL) {
      return 'left';
    }

    return 'right';
  }

  return 'left';
};

export const getWritingDirection = language => {
  return isArabicLang(language) ? 'rtl' : 'ltr';
};