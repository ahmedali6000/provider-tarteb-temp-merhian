import React, {useMemo} from 'react';
import {Text, I18nManager} from 'react-native';
import {fonts} from '../../fonts';

const AppText = ({
  weight = 'regular',
  align,
  direction,
  style,
  children,
  ...props
}) => {
  const isRTL = I18nManager.isRTL;

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
          textAlign: 'auto',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]}>
      {children}
    </Text>
  );
};

export default React.memo(AppText);