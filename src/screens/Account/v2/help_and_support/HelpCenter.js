import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import { useSelector } from 'react-redux';

const HelpCenter = ({navigation}) => {
  const {t} = useTranslation();
const user = useSelector(state => state.auth.user);
  const helpItems = [
    {
      id: 'messages',
      title: t('help_main.support_messages'),
      icon: 'mail-open-outline',
      onPress: () => navigation.navigate('SupportMessagesScreen'),
    },
    {
      id: 'contact',
      title: t('help_main.contact_support'),
      icon: 'paper-plane-outline',
      onPress: () => Linking.openURL(`tel:${user?.support_phone}`),
    },
    {
      id: 'faq',
      title: t('help_main.faq'),
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('FaqScreen'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="help_main.title"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.bannerCard}>
          <Image
            source={require('./../../../../../assets/app/images/vectors/help-main.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuList}>
          {helpItems.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.menuItem}
              onPress={item.onPress}>

              <View style={styles.menuRight}>
                 <Ionicons
                  name={item.icon}
                  size={21}
                  style={{fontWeight:'bold'}}
                  color="#4AA5E6"
                />
                <AppText weight="medium" style={styles.menuTitle}>
                  {item.title}
                </AppText>

               
              </View>


              <Ionicons
                name="chevron-back-outline"
                size={19}
                color="#1F1F1F"
                style={styles.arrowIcon}
              />

             
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HelpCenter;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  bannerCard: {
    // height: 130,
    borderRadius: 16,
    backgroundColor: '#EAF4FA',
    marginTop: 18,
    paddingVertical:40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bannerImage: {
    width: 110,
    height: 110,
  },

  menuList: {
    marginTop: 20,
  },
  menuItem: {
    // minHeight: 50,
    paddingVertical:12,
    flexDirection: 'row',
    paddingHorizontal:10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    marginStart: 8,
  },
  arrowIcon: {
    marginEnd: 4,
  },
});