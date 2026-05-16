import React, {useMemo} from 'react';
import {Text, I18nManager, StyleSheet} from 'react-native';
import {fonts} from '../../fonts';
import {getAutoTextAlign, getWritingDirection} from '../utils/rtlText';
// عدّل المسار حسب مكان ملف rtlText عندك

const AppText = ({
  weight = 'regular',
  direction,
  style,
  children,
  ...props
}) => {
  const isRTL = I18nManager.isRTL;

  const flatStyle = StyleSheet.flatten(style);
  const externalTextAlign = flatStyle?.textAlign;

  const shouldKeepCenter = externalTextAlign === 'center';

  const fontFamily = useMemo(() => {
    return isRTL
      ? fonts.ar[weight] || fonts.ar.regular
      : fonts.en[weight] || fonts.en.regular;
  }, [isRTL, weight]);

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily,
          writingDirection: direction || getWritingDirection(),
        },

        style,

        {
          textAlign: shouldKeepCenter ? 'center' : getAutoTextAlign(),
        },
      ]}>
      {children}
    </Text>
  );
};

export default React.memo(AppText);