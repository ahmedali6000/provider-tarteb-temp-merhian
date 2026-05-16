import React from 'react';
import {View, StyleSheet, TouchableOpacity, I18nManager} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import AppText from './AppText';

const AppHeader = ({
  title,
  titleKey,
  onBack,
  rightContent = null,
  containerStyle,
  titleStyle,
  showBack = true,
}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <View style={[styles.container, containerStyle]}>
      
    <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.85}
            style={styles.backButton}>
            <Ionicons
              name={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
              size={24}
              color="#222"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        <AppText weight="bold" style={[styles.title, titleStyle]}>
          {titleKey ? t(titleKey) : title}
        </AppText>
      </View>

     <View style={styles.side}>
        {rightContent}
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
     
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'red'
  },
  title: {
    fontSize: 18,
    color: '#1F1F1F',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});