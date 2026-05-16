import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../../../shared/AppText';
import Svg, {Circle} from 'react-native-svg';
import RNRestart from 'react-native-restart';
import AppButton from '../../../component/AppButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { domain, Language_KEY } from '../../../utils/app';
 import { logout } from '../../../redux/actions';
import axios from 'axios';


const ProfileScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const user = useSelector(state => state.auth.user);
  const tokenK = useSelector(state => state.auth.token);
   const [visible, setVisible] = React.useState(false);
 const dispatch = useDispatch();
    const [REMOVE_ACCOUNT_HANDLER_LOADER, CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER] = React.useState(false);
 const Logout = () => { 
        dispatch(logout());
    };
   const REMOVE_ACCOUNT_HANDLER = () => {
          
          
        }
  
    

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [removeAccountSheetVisible, setRemoveAccountSheetVisible] =
    useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language === 'ar' ? 'ar' : 'en',
  );
 
//  const changeLang = (lang) => {
//         AsyncStorage.setItem(Language_KEY,lang);
//         i18n.changeLanguage(lang)
//         setTimeout(() => {
//             RNRestart.Restart();
//         }, 500);
        
// }
  const currentPoints = Number(user?.points || 0);
  const maxPoints = Number(user?.maxPoints || 2000);
  const remainingPoints = Math.max(maxPoints - currentPoints, 0);

  const progressPercent = useMemo(() => {
    if (!maxPoints) {
      return 0;
    }
    return Math.min((currentPoints / maxPoints) * 100, 100);
  }, [currentPoints, maxPoints]);

 const changeLanguage = async () => {
  await AsyncStorage.setItem(Language_KEY, selectedLanguage);
  await i18n.changeLanguage(selectedLanguage);
  setLanguageSheetVisible(false);
}; 

  const handleLogout = () => {
    setLogoutSheetVisible(false);
    // dispatch logout هنا
    dispatch(logout())
  };



  const handleRemoveAccount = () => {
    setRemoveAccountSheetVisible(false);
    var config = {method: 'delete',url: domain + `/api/remove-my-account`,headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'}};
          axios(config).then(res => {
              CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER(true)
              setTimeout(() => {
                  CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER(false)
                  setVisible(false)
              }, 800);
              Logout();
             
          }).catch(err=>{
            alert(err);
              console.warn(err)
          }).finally(() => {
              
          })
  };


  const ConfirmBottomSheet = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  danger = false,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.confirmSheetContainer} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <AppText weight="bold" style={styles.confirmTitle}>
            {title}
          </AppText>

          <AppText style={styles.sheetDescription}>
            {description}
          </AppText>

          <View style={styles.confirmButtonsRow}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                danger && styles.cancelButtonDangerBorder,
              ]}
              onPress={onClose}>
              <AppText
                weight="bold"
                style={[
                  styles.cancelButtonText,
                  danger && styles.cancelButtonDangerText,
                ]}>
                {cancelText}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                danger ? styles.dangerButton : styles.primaryButtonSheet,
              ]}
              onPress={onConfirm}>
              <AppText weight="bold" style={styles.confirmButtonText}>
                {confirmText}
              </AppText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
  const menuItems = [
    {
      key: 'edit_profile',
      title: t('profile.edit_profile'),
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfileScreen'),
    },
    {
      key: 'wallet',
      title: t('profile.wallet'),
      icon: 'wallet-outline',
      onPress: () => navigation.navigate('WalletScreen'),
    },
    {
      key: 'addresses',
      title: t('profile.addresses'),
      icon: 'location-outline',
      onPress: () => navigation.navigate('AddressesScreen'),
    },
    {
      key: 'language',
      title: t('profile.language'),
      icon: 'language-outline',
      extraText: selectedLanguage === 'ar' ? t('profile.arabic') : 'English',
      onPress: () => setLanguageSheetVisible(true),
    },
    {
      key: 'logout',
      title: t('profile.logout'),
      icon: 'log-out-outline',
      danger: true,
      onPress: () => setLogoutSheetVisible(true),
    },
  ];


  const badgeImage = useMemo(() => {
  const percent = (user?.points / user?.maxPoints) * 100;

  if (percent > 75) {
    return require('../../../../assets/app/images/account/golden.png');
  } else if (percent >= 40) {
    return require('../../../../assets/app/images/account/sliver.png');
  } else {
    return require('../../../../assets/app/images/account/prime.png');
  }
}, [user]);

const userLevelKey = useMemo(() => {
  const percent =
    user?.maxPoints > 0
      ? (user.points / user.maxPoints) * 100
      : 0;

  if (percent > 75) {
    return 'profile.level_golden';
  } else if (percent >= 40) {
    return 'profile.level_silver';
  } else {
    return 'profile.level_prime';
  }
}, [user]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ProfileAvatar 
            image={user?.image}
            points={user?.points}
            maxPoints={user?.maxPoints}
            />

            <AppText weight="bold" style={styles.userName}>
              {user?.name || t('profile.default_name')}
            </AppText>

            <View style={styles.accountTypeRow}>
                <Image source={badgeImage} style={styles.badge} />
              <AppText style={styles.accountTypeText}>
               {t(userLevelKey)}
              </AppText>
              {/* <AppText style={styles.accountEmoji}>📦</AppText> */}
            
            </View>
          </View>

     <View style={styles.pointsCard}>
  <View style={styles.pointsTopRow}>
    <View style={styles.pointsRightBlock}>
      <AppText weight="bold" style={styles.pointsTitle}>
        {t('profile.points_label')}
      </AppText>

      <View style={styles.pointsNumbersRow}>
         <AppText weight="bold" style={styles.pointsBigNumber}>
          {currentPoints} 
        </AppText>  
        <AppText style={styles.pointsSmallNumber}>
             {maxPoints}  /
        </AppText>

       
      </View>
    </View>
 
    <TouchableOpacity onPress={() => navigation.navigate('LoyaltyScreen')} style={styles.pointsLeftSection}>
      <View style={styles.pointsInfoRow}>
        <View style={styles.pointsMiddleBlock}>
          <AppText style={styles.pointsDesc}>
            {t('profile.points_remaining', {count: remainingPoints})}
          </AppText>

          <AppText style={styles.pointsDesc}>
            {t('profile.points_subtitle')}
          </AppText>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('LoyaltyScreen')} style={styles.pointsArrowBox}>
          <Ionicons
            name="arrow-up-outline"
            size={16}
            color="#2E2E2E"
            style={styles.pointsArrowIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {width: `${Math.max(progressPercent, 8)}%`},
          ]}
        />
      </View>
    
    </TouchableOpacity>
  </View>
</View>
          <View style={styles.mainCard}>
            <View style={styles.menuList}>
              {menuItems.map((item, index) => (
                 (user?.paymentAva != 0 || item.key != 'wallet')&& 

                 
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.menuItem,
                    index !== menuItems.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}>
                  <View style={styles.menuRightContent}>
                   
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.danger ? '#FF4B55' : '#4BA2D8'}
                    />
                    <AppText
                      weight="medium"
                      style={[
                        styles.menuTitle,
                        item.danger && styles.menuDangerTitle,
                      ]}>
                      {item.title}
                    </AppText>

                   
                     {!!item.extraText && (
                      <AppText style={styles.menuExtraText}>
                        {item.extraText}
                      </AppText>
                    )}
                  </View>

                   <Ionicons
                    name="chevron-back-outline"
                    size={18}
                    color={item.danger ? '#FF4B55' : '#1E1E1E'}
                    style={styles.leftChevron}
                  />
                </TouchableOpacity>
              ))}
            </View>

          
          </View>
            <View style={styles.bottomToolsRow}>
                <TouchableOpacity
                style={styles.bottomToolItem}
                onPress={() => navigation.navigate('HelpCenter')}>
                <Ionicons
                  name="help-buoy-outline"
                  size={25}
                  color="#2A2A2A"
                />
                <AppText weight="medium" style={styles.bottomToolText}>
                  {t('profile.support_help')}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomToolItem, styles.bottomToolBorder]}
                onPress={() => navigation.navigate('AbourCenter')}>
                <Ionicons
                  name="information-circle-outline"
                  size={25}
                  color="#2A2A2A"
                />
                <AppText weight="medium" style={styles.bottomToolText}>
                  {t('profile.about_arrangement')}
                </AppText>
              </TouchableOpacity>

        
            </View>

          <TouchableOpacity
            style={styles.removeAccountLink}
            onPress={() => setRemoveAccountSheetVisible(true)}>
            <AppText weight='bold' style={styles.removeAccountText}>
              {t('profile.remove_account')}
            </AppText>
          </TouchableOpacity>
        </ScrollView>

        <LanguageBottomSheet
          visible={languageSheetVisible}
          onClose={() => setLanguageSheetVisible(false)}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          onApply={changeLanguage}
          t={t}
        />

        <ConfirmBottomSheet
          visible={logoutSheetVisible}
          onClose={() => setLogoutSheetVisible(false)}
          onConfirm={handleLogout}
          title={t('profile.logout_sheet_title')}
          description={t('profile.logout_sheet_desc')}
          confirmText={t('profile.logout')}
          cancelText={t('profile.cancel')}
          danger={false}
        />

        <ConfirmBottomSheet
          visible={removeAccountSheetVisible}
          onClose={() => setRemoveAccountSheetVisible(false)}
          onConfirm={handleRemoveAccount}
          title={t('profile.remove_account_sheet_title')}
          description={t('profile.remove_account_sheet_desc')}
          confirmText={t('profile.remove_account')}
          cancelText={t('profile.cancel')}
          danger
        />
      </View>
    </SafeAreaView>
  );
};

const ProfileAvatar = ({image, points = 0, maxPoints = 2000}) => {
  const size = 96;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safePoints = Number(points || 0);
  const safeMaxPoints = Number(maxPoints || 0);

  const percent =
    safeMaxPoints > 0 ? Math.min(safePoints / safeMaxPoints, 1) : 0;

  const strokeDashoffset = circumference * (1 - percent);

  return (
    <View style={styles.avatarWrap}>
      <Svg width={size} height={size} style={styles.avatarSvg}>
        <Circle
          stroke="#EAEAEA"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke="#F39A20"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.avatarInner}>
        <Image
          source={{uri: image || 'https://tarteb.app/boy.png'}}
          style={styles.avatarImage}
        />
      </View>
    </View>
  );
};

const LanguageBottomSheet = ({
  visible,
  onClose,
  selectedLanguage,
  setSelectedLanguage,
  onApply,
  t,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <AppText weight="bold" style={styles.sheetTitle}>
            {t('profile.language')}
          </AppText>

          <TouchableOpacity
            style={styles.languageRow}
            onPress={() => setSelectedLanguage('ar')}>
            <View style={styles.languageRight}>
              <Image source={ require('./../../../../assets/app/images/eg.png')} style={styles.icon} />
              <AppText style={styles.languageText}>{t('profile.arabic')}</AppText>
            </View>

            <View
              style={[
                styles.radioOuter,
                selectedLanguage === 'ar' && styles.radioOuterActive,
              ]}>
              {selectedLanguage === 'ar' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageRow}
            onPress={() => setSelectedLanguage('en')}>
            <View style={styles.languageRight}>
              {/* <AppText style={styles.flag}>🇬🇧</AppText> */}
              <Image source={ require('./../../../../assets/app/images/en.png')} style={styles.icon} />
              <AppText style={styles.languageText}>English</AppText>
            </View>

            <View
              style={[
                styles.radioOuter,
                selectedLanguage === 'en' && styles.radioOuterActive,
              ]}>
              {selectedLanguage === 'en' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
            <AppButton 
              title= {t('profile.apply')}
              // onPress={() => console.log('Selected:', selectedLanguage)} 
              onPress={onApply}
            />
          {/* <TouchableOpacity style={styles.primaryButton} onPress={onApply}>
            <AppText weight="bold" style={styles.primaryButtonText}>
              {t('profile.apply')}
            </AppText>
          </TouchableOpacity> */}
        </Pressable>
      </Pressable>
    </Modal>
  );
};



export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 120,
  },

  header: {
    alignItems: 'center',
    paddingTop: 6,
    marginBottom: 18,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSvg: {
    position: 'absolute',
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  userName: {
    fontSize: 20,
    color: '#1F1F1F',
    marginBottom: 3,
  },
  accountTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountTypeText: {
    fontSize: 14,
    color: '#7B7B7B',
    marginRight: 4,
  },
  badge: {
    width: 20,
    height: 20,
  },

 pointsCard: {
  backgroundColor: '#ECECEC',
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingTop: 14,
  paddingBottom: 12,
  marginBottom: 14,
},

pointsTopRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

pointsRightBlock: {
  width: 94,
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  marginLeft: 10,
  // backgroundColor:'red'
},

pointsTitle: {
  fontSize: 15,
  color: '#1F1F1F',
  textAlign: 'auto',
  marginBottom: 4,
},

pointsNumbersRow: {
  flexDirection: 'row',
  
  alignItems: 'center',
   
},

pointsBigNumber: {
  fontSize: 30,
  color: '#1F1F1F',
   
  marginEnd:5
},

pointsSmallNumber: {
  fontSize: 12,
  color: '#8C8C8C',
  marginRight: 4,
  marginBottom: 3,
},

pointsLeftSection: {
  flex: 1,
 paddingStart:20,

},

pointsInfoRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
   
},

pointsMiddleBlock: {
  flex: 1,
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingRight: 8,
},

pointsDesc: {
  fontSize: 13,
  color: '#4F4F4F',
  textAlign: 'auto',
  lineHeight: 19,
  
  //  justifyContent:'flex-start'
},

pointsArrowBox: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#F7F7F7',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 2,
},

pointsArrowIcon: {
  transform: [{rotate: '-45deg'}],
},

progressTrack: {
  // width: 126,
  height: 13,
  borderRadius: 8,
  backgroundColor: '#D9D9D9',
  marginTop: 10,
  marginEnd:20,
  // marginLeft: 34,
  overflow: 'hidden',
},

progressFill: {
  height: '100%',
  borderRadius: 8,
  backgroundColor: '#F0830F',
},

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuList: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  menuItem: {
    minHeight: 51,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  leftChevron: {
    marginLeft: 2,
  },
  menuRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    marginHorizontal: 8,
  },
  menuDangerTitle: {
    color: '#FF3B30',
  },
  menuExtraText: {
    fontSize: 14,
    color: '#8B8B8B',
    marginLeft: 8,
  },

  bottomToolsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    marginTop: 15,
  },
  bottomToolItem: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
    paddingHorizontal:20,
    alignItems: 'flex-start',
    marginEnd:6,
    backgroundColor: '#ddd',
    borderRadius:20
  },
  bottomToolBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#EFEFEF',
  },
  bottomToolText: {
    marginTop: 8,
    fontSize: 16,
    color: '#202020',
  },

  removeAccountLink: {
    alignSelf: 'center',
    marginTop: 25,
  },
  removeAccountText: {
    fontSize: 16,
    color: 'red',
    textDecorationColor:'red',
    textDecorationLine:'underline'

  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.24)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  confirmSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 18,
  },
  confirmTitle: {
    fontSize: 22,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },

  languageRow: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 18,
    marginLeft: 8,
  },
  languageText: {
    fontSize: 15,
    color: '#1F1F1F',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: '#C9C9C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#3B97D3',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B97D3',
  },

  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#3B97D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  confirmButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    width: '48.5%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonSheet: {
    backgroundColor: '#3B97D3',
  },
  dangerButton: {
    backgroundColor: '#FF4B55',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
  },

  cancelButton: {
    width: '48.5%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3B97D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonDangerBorder: {
    borderColor: '#FF4B55',
  },
  cancelButtonText: {
    color: '#3B97D3',
    fontSize: 15,
  },
  cancelButtonDangerText: {
    color: '#FF4B55',
  },
icon: {
    width: 24,
    height: 24,
    marginEnd:8,
    borderRadius: 12,
  },
});