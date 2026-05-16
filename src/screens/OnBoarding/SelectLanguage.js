import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import AppText from '../../shared/AppText';
import LanguageOption from '../../component/LanguageOption';
import AppButton from '../../component/AppButton';

import {Language_KEY} from '../../utils/app';
import {CHANGE_APP_LANG} from '../../redux/actions/ActionTypes';

const SelectLanguage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {i18n} = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [loading, setLoading] = useState(false);

  const languages = [
    {
      id: 'ar',
      label: 'العربية',
      icon: require('./../../../assets/app/images/eg.png'),
    },
    {
      id: 'en',
      label: 'English',
      icon: require('./../../../assets/app/images/en.png'),
    },
  ];

  const changeLang = async lang => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      await AsyncStorage.setItem(Language_KEY, lang);

      await i18n.changeLanguage(lang);

      dispatch({
        type: CHANGE_APP_LANG,
        payload: lang,
      });

      navigation.replace('OnBoarding');
    } catch (error) {
      console.log('CHANGE LANGUAGE ERROR:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A8E6FF" />

      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']}
        locations={[0, 0.35]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('./../../../assets/app/logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerContainer}>
            <AppText weight="bold" style={styles.title}>
              اختر لغة التطبيق
            </AppText>

            <AppText weight="bold" style={styles.subtitle}>
              Choose App Language
            </AppText>
          </View>

          <View style={styles.optionsContainer}>
            {languages.map(lang => (
              <LanguageOption
                key={lang.id}
                label={lang.label}
                icon={lang.icon}
                selected={selectedLanguage === lang.id}
                onSelect={() => {
                  if (!loading) {
                    setSelectedLanguage(lang.id);
                  }
                }}
              />
            ))}
          </View>

          <View style={styles.buttonWrapper}>
            <AppButton
              title={loading ? '...' : 'متابعة'}
              disabled={loading}
              onPress={() => changeLang(selectedLanguage)}
            />

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#0D2965" />
              </View>
            ) : null}
          </View>

          <View style={styles.footerContainer}>
            <AppText style={styles.footerText}>
              يمكنك تغييرها لاحقاً من الإعدادات.
            </AppText>

            <AppText style={styles.footerText}>
              You can change this later in settings.
            </AppText>
          </View>
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
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 76,
    height: 76,
    marginBottom: 22,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 46,
  },
  title: {
    fontSize: 24,
    color: '#071B45',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 21,
    color: '#283A5E',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 14,
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 4,
  },
  loadingBox: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    marginTop: 35,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SelectLanguage;