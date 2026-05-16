import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import AppText from '../shared/AppText'; // Assuming AppText is in a 'shared' folder
import { useTranslation } from 'react-i18next';

// You might need to provide an actual image for the back arrow, e.g., in assets/icons/back_arrow.png
// For now, we'll use a simple text arrow or a placeholder image.
const backArrowIcon = require('../../assets/app/images/icons/back-arrow.png'); // Placeholder, replace with actual path

const BackButton = ({ onPress, style, iconStyle }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onPress}>
      {/* Using an Image for the back arrow icon */}
      <Image source={backArrowIcon} style={[styles.icon, iconStyle]} />
      {/* Fallback to text if image is not available or preferred */}
      {/* <AppText style={[styles.backButtonText, iconStyle]}>{t('common.back_arrow')}</AppText> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    transform: [{ scaleX: -1 }], // Flip for RTL if needed, assuming default arrow points left
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
});

export default BackButton;
