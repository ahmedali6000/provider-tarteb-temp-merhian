import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppText from '../../shared/AppText';
import {useTranslation} from 'react-i18next';


const HomeBanner = ({onPress}) => {
   const {t} = useTranslation();
   
  return (
   <View style={styles.wrapper}>
      <LinearGradient
        colors={['#071B45', '#0D2965', '#133984']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}>
        <ImageBackground
          source={require('../../../assets/app/data/banner.png')}
          resizeMode="cover"
          style={styles.imageBg}
          imageStyle={styles.imageStyle}>
          <View style={styles.content}>
            <AppText weight="bold" style={styles.title}>
              {t('home_banner.quick_order_title')}
            </AppText>

            <TouchableOpacity style={styles.button} onPress={onPress}>
              <AppText weight="bold" style={styles.buttonText}>
                {t('home_banner.quick_order_button')}
              </AppText>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 25,
    marginTop: 14,
  },
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 135,
  },
  imageBg: {
    flex: 1,
    
    justifyContent: 'center',
  },
  imageStyle: {
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
  },
  title: {
    color: '#fff',
    
    fontSize: 18,
    lineHeight: 28,
    // textAlign: 'right',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#F7931E',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});