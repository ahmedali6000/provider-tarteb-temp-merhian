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
 import { AppStoreLink, googlePlayLink, onelink } from '../../../../utils/app';
import { useSelector } from 'react-redux';
 import { shareImage } from '../../../../utils/base64';
 import Share from 'react-native-share';
import RNFS from 'react-native-fs';
 
 

const AbourCenter = ({navigation}) => {
  const {t} = useTranslation();
  const user = useSelector( state => state.auth.user );
    const wallet = useSelector( state => state.auth.wallet );

    const onShare = async () => {
  try {
    const inviteCode = user?.id ?? '';

    const message = `🎉 شارك تطبيق ترتيب TARTEB
واحصل على 50 جنيه عند دعوة 10 أشخاص

📲 ${onelink}?ref=${inviteCode}

💬 كود الدعوة: ${inviteCode}`;

    const imageUrl = 'https://tarteb.app/share.jpeg';

    const localPath = `${RNFS.CachesDirectoryPath}/share.jpg`;

    // 👇 حمل الصورة من السيرفر
    await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: localPath,
    }).promise;

    const shareOptions = {
      url: 'file://' + localPath,
      message,
      type: 'image/jpeg',
      failOnCancel: false,
    };

    await Share.open(shareOptions);

  } catch (error) {
    if (
      error?.message?.includes('User did not share') ||
      error?.error === 'User did not share'
    ) {
      return;
    }

    console.log('SHARE ERROR:', error);
  }
};

const helpItems = [
  {
    id: 'who_we_are',
    title: t('about_main.who_we_are'),
    icon: 'information-circle-outline',
    onPress: () =>
      navigation.navigate('AboutDocScreen', {
        title: t('about_main.who_we_are'),
        doc: 'about',
      }),
  },
  {
    id: 'share_app',
    title: t('about_main.share_app'),
    icon: 'share-social-outline',
    onPress: ()=> onShare()
  },
  {
    id: 'rate_app',
    title: t('about_main.rate_app'),
    icon: 'help-circle-outline',
    onPress: ()=>{Linking.openURL((Platform.OS == 'ios') ? AppStoreLink : googlePlayLink);},
  },
  {
    id: 'privacy_policy',
    title: t('about_main.privacy_policy'),
    icon: 'document-text-outline',
    onPress: () =>
      navigation.navigate('AboutDocScreen', {
        title: t('about_main.privacy_policy'),
        doc: 'privacy',
      }),
  },
  {
    id: 'tems_conditions',
    title: t('about_main.tems_conditions'),
    icon: 'reader-outline',
    onPress: () =>
      navigation.navigate('AboutDocScreen', {
        title: t('about_main.tems_conditions'),
        doc: 'terms',
      }),
  },
];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="about_main.title"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.bannerCard}>
          <Image
            source={require('./../../../../../assets/app/images/vectors/about-main.png')}
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

export default AbourCenter;

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