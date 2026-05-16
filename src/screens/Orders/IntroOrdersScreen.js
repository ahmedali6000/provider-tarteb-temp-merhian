import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, I18nManager, SafeAreaView } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';import HeaderApp from '../../shared/Header';
import { useTranslation } from 'react-i18next';
import { btnColor } from '../../utils/app';

// I18nManager.forceRTL(true); // للتأكد أن الواجهة يمين

export default function IntroOrdersScreen({ navigation }) {

    const {t,i18n} = useTranslation();
  return (
    <SafeAreaView style={{flex:1}}>
    <HeaderApp navigation={navigation}  drawer={true} iconName="alarm-outline" title={t('order.ordersAndBundles')} />
    <View style={styles.container}>
      <Text style={styles.heading}>{t('bundle.welcomeHead')} 👋</Text>
      <Text style={styles.subheading}>{t('bundle.welcomeDes')}</Text>

      <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('OrdersScreen')}>
        <View style={styles.iconContainer}>
          <Ionicons name="reader-outline" size={22} color={btnColor} />
        </View>
        <Text style={[styles.boxText,(i18n.language == 'ar') && {textAlign:'left'}]}>{t('bundle.orders')}</Text>
        <Ionicons name="chevron-back-outline" size={20} color={btnColor} style={styles.arrow} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('MyBundles')}>
        <View style={styles.iconContainer}>
          <Ionicons name="gift-outline" size={22} color={btnColor} />
        </View>
        <Text style={[styles.boxText,(i18n.language == 'ar') && {textAlign:'left'}]}>{t('bundle.bundles')}</Text>
        <Ionicons name="chevron-back-outline" size={20} color={btnColor} style={styles.arrow} />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 24,
  },
  heading: {
    fontSize: 18,
    fontFamily:'Tajawal-Bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
     fontFamily:'Tajawal-Bold',
    color: '#777',
    marginBottom: 32,
    textAlign: 'center',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderColor: '#EEE',
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    marginEnd:15,
    backgroundColor: '#F3EEFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  boxText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
     fontFamily:'Tajawal-Bold',
  },
  arrow: {
    marginRight: 4,
  },
});
