import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import AppButton from '../../component/AppButton';
import AppText from '../../shared/AppText';
import { useTranslation } from 'react-i18next';

const Noenternet = ({ navigation }) => {
  const { t } = useTranslation();

  const handleRetry = () => {
    // إعادة المحاولة
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/app/images/vectors/no-internet.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          <AppText weight="bold" style={styles.title}>
            {t('noInternet.title')}
          </AppText>

          <AppText style={styles.subtitle}>
            {t('noInternet.subtitle')}
          </AppText>

          <AppButton
            title={t('noInternet.button')}
            onPress={handleRetry}
            style={styles.mainButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Noenternet;

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
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 120,
    height: 120,
    marginBottom: 22,
  },

  title: {
    fontSize: 22,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  mainButton: {
    width: '100%',
    backgroundColor: '#2D9CDB',
    borderRadius: 10,
  },
});