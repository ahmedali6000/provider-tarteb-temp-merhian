import {useTranslation} from 'react-i18next';

export default function useAppFont() {
  const {i18n} = useTranslation();

  const isArabic = i18n.language === 'ar';

  return {
    fontFamily: isArabic ? 'Vazirmatn-Regular' : 'Poppins-Regular',
    fontFamilyBold: isArabic ? 'Vazirmatn-Bold' : 'Poppins-Bold',
  };
}