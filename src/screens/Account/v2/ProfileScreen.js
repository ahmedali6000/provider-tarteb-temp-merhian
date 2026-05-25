import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../../../shared/AppText';
import AppButton from '../../../component/AppButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {domain, Language_KEY} from '../../../utils/app';
import {logout} from '../../../redux/actions';
import axios from 'axios';

const ProfileScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth.user);
  const wallet = useSelector(state => state.auth.wallet);
  const tokenK = useSelector(state => state.auth.token);

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [removeAccountSheetVisible, setRemoveAccountSheetVisible] =
    useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language === 'ar' ? 'ar' : 'en',
  );

  const walletBalance = Number(wallet || user?.credit || 0);

  const userImage =
    user?.image ||
    user?.profile_photo_path ||
    'https://tarteb.app/boy.png';

  const providerCategory =
    user?.category_name ||
    user?.category?.name ||
    user?.category ||
    t('profile.default_provider_category');

  const changeLanguage = async () => {
    await AsyncStorage.setItem(Language_KEY, selectedLanguage);
    await i18n.changeLanguage(selectedLanguage);
    setLanguageSheetVisible(false);
  };

  const handleLogout = () => {
    setLogoutSheetVisible(false);
    dispatch(logout());
  };

  const handleRemoveAccount = () => {
    setRemoveLoading(true);

    const config = {
      method: 'delete',
      url: domain + `/api/remove-my-account`,
      headers: {
        Authorization: 'Bearer ' + tokenK,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    axios(config)
      .then(() => {
        setRemoveAccountSheetVisible(false);
        dispatch(logout());
      })
      .catch(err => {
        console.warn(err);
      })
      .finally(() => {
        setRemoveLoading(false);
      });
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
      key: 'ratings',
      title: t('profile.ratings'),
      icon: 'star-outline',
      onPress: () => navigation.navigate('RatingsScreen'),
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <Image source={{uri: userImage}} style={styles.avatarImage} />
            </View>

            <AppText weight="bold" style={styles.userName}>
              {user?.name || t('profile.default_name')}
            </AppText>

            <AppText style={styles.providerType}>{providerCategory}</AppText>
          </View>

          <View style={styles.walletCard}>
            

            <View style={styles.walletInfo}>
              <AppText style={styles.walletLabel}>
                {t('profile.current_wallet_balance')}
              </AppText>

              <View style={styles.walletAmountRow}>
                <AppText weight="bold" style={styles.walletAmount}>
                  {walletBalance}
                </AppText>

                <AppText style={styles.walletCurrency}>
                  {t('profile.currency_egp')}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.chargeButton}
              onPress={() => navigation.navigate('WalletScreen')}>
              <AppText weight="bold" style={styles.chargeButtonText}>
                {t('profile.charge_balance')}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.75}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}>
               

                <View style={styles.menuContent}>
                  <View style={styles.menuTextRow}>

                     <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? '#FF3B30' : '#3498DB'}
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

                 
                </View>

                 <Ionicons
                  name="chevron-back-outline"
                  size={18}
                  color={item.danger ? '#FF3B30' : '#1F1F1F'}
                />

              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomToolsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bottomToolItem}
              onPress={() => navigation.navigate('HelpCenter')}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color="#2A2A2A"
              />

              <AppText weight="medium" style={styles.bottomToolText}>
                {t('profile.support_help')}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.bottomToolItem}
              onPress={() => navigation.navigate('AbourCenter')}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#2A2A2A"
              />

              <AppText weight="medium" style={styles.bottomToolText}>
                {t('profile.about_arrangement')}
              </AppText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.removeAccountLink}
            onPress={() => setRemoveAccountSheetVisible(true)}>
            <AppText weight="bold" style={styles.removeAccountText}>
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
          loading={removeLoading}
        />
      </View>
    </SafeAreaView>
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
              <Image
                source={require('./../../../../assets/app/images/eg.png')}
                style={styles.langIcon}
              />
              <AppText style={styles.languageText}>
                {t('profile.arabic')}
              </AppText>
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
              <Image
                source={require('./../../../../assets/app/images/en.png')}
                style={styles.langIcon}
              />
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

          <AppButton title={t('profile.apply')} onPress={onApply} />
        </Pressable>
      </Pressable>
    </Modal>
  );
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
  loading = false,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.confirmSheetContainer} onPress={() => {}}>
          <View style={styles.sheetHandle} />

          <AppText weight="bold" style={styles.confirmTitle}>
            {title}
          </AppText>

          <AppText style={styles.sheetDescription}>{description}</AppText>

          <View style={styles.confirmButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.cancelButton,
                danger && styles.cancelButtonDangerBorder,
              ]}
              onPress={onClose}
              disabled={loading}>
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
              activeOpacity={0.85}
              style={[
                styles.confirmButton,
                danger ? styles.dangerButton : styles.primaryButtonSheet,
              ]}
              onPress={onConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText weight="bold" style={styles.confirmButtonText}>
                  {confirmText}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 118,
  },

  header: {
    alignItems: 'center',
    paddingTop: 4,
    marginBottom: 14,
  },

  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },

  userName: {
    fontSize: 18,
    color: '#171717',
    textAlign: 'center',
    marginBottom: 3,
  },

  providerType: {
    fontSize: 12,
    color: '#7E7E7E',
    textAlign: 'center',
  },

  walletCard: {
    minHeight: 84,
    backgroundColor: '#ECECEC',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 12,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chargeButton: {
    height: 38,
    minWidth: 94,
    borderRadius: 10,
    backgroundColor: '#F58220',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  chargeButtonText: {
    fontSize: 11.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  walletInfo: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
    marginHorizontal: 12,
  },

  walletLabel: {
    fontSize: 14,
    color: '#9A9A9A',
    marginBottom: 5,
    textAlign: 'auto',
  },

  walletAmountRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'flex-start',
  },

  walletAmount: {
    fontSize: 32,
    color: '#171717',
    lineHeight: 32,
  },

  walletCurrency: {
    fontSize: 16,
    color: '#777777',
    marginHorizontal: 4,
    marginBottom: 4,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },

  menuItem: {
    minHeight: 48,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  menuContent: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuTextRow: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  menuTitle: {
    fontSize: 16,
    color: '#171717',
    marginHorizontal: 8,
    textAlign: 'auto',
    
  },

  menuDangerTitle: {
    color: '#FF3B30',
  },

  menuExtraText: {
    fontSize: 11,
    color: '#8B8B8B',
    marginHorizontal: 4,
  },

  bottomToolsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 3,
  },

  bottomToolItem: {
    width: '48.5%',
    minHeight: 78,
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  bottomToolText: {
    marginTop: 7,
    fontSize: 12,
    color: '#202020',
    textAlign: 'center',
  },

  removeAccountLink: {
    alignSelf: 'center',
    marginTop: 20,
  },

  removeAccountText: {
    fontSize: 13,
    color: '#FF3B30',
    textDecorationColor: '#FF3B30',
    textDecorationLine: 'underline',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.24)',
    justifyContent: 'flex-end',
  },

  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  confirmSheetContainer: {
    backgroundColor: '#FFFFFF',
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
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  languageRight: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
  },

  langIcon: {
    width: 24,
    height: 24,
    marginEnd: 8,
    borderRadius: 12,
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

  confirmButtonsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
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
    color: '#FFFFFF',
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
});