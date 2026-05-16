import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
  I18nManager,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
 import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import AppButton from '../../../../component/AppButton';
import useAppFont from '../../../../hooks/useAppFont';
import CountryBottomSheet from '../../../../component/CountryBottomSheet';
import {countries} from '../../../../utils/DATA';
import api from '../../../../services/api';
import {UPDATE_CREDIT} from '../../../../redux/actions/ActionTypes';
import { Snackbar } from 'react-native-paper';
 
const TransferBalanceScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const dispatch = useDispatch();
  const isRTL = I18nManager.isRTL;

  const user = useSelector(state => state.auth.user);
  const wallet = useSelector(state => state.auth.wallet);


  const [visible, setVisible] = React.useState(false);

 


  const [tphone, setTphone] = useState('');
  const [tamount, setTamount] = useState('');
  const [loader, setLoader] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const [BTresponse, setBTresponse] = useState({
    color: 'red',
    sent: '',
    complete: false,
  });

  const amountText = useMemo(() => {
    return tamount ? Number(tamount) : 0;
  }, [tamount]);

  const clearResponse = () => {
    if (BTresponse?.sent) {
      setBTresponse({
        color: 'red',
        sent: '',
        complete: false,
      });
    }
  };

  const normalizeLocalPhone = rawPhone => {
    let clean = String(rawPhone || '').replace(/[^0-9]/g, '');

    // لو المستخدم كتب 0 في البداية نشيله
    // مثال:
    // 01099602255 -> 1099602255
    // 0551234567 -> 551234567
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }

    return clean;
  };

  const validateTransferPhone = () => {
    const normalizedLocalPhone = normalizeLocalPhone(tphone);
    const requiredLength = selectedCountry?.length || 10;

    if (!normalizedLocalPhone || normalizedLocalPhone.length !== requiredLength) {
      setBTresponse({
        color: 'red',
        sent: t('transfer_credit.balance_transfer.phone.notValid'),
        complete: false,
      });
      return null;
    }

    const fullPhone = `${selectedCountry.code}${normalizedLocalPhone}`;
    const myPhone = String(user?.phone || '').replace(/\s/g, '');

    if (fullPhone === myPhone) {
      setBTresponse({
        color: 'red',
        sent: t('transfer_credit.balance_transfer.phone.yourselfnot'),
        complete: false,
      });
      return null;
    }

    return {
      fullPhone,
      cleanNumber: normalizedLocalPhone,
    };
  };

  const validateAmount = () => {
    const amountNumber = Number(tamount);

    if (!amountNumber || amountNumber < 50) {
      setBTresponse({
        color: 'red',
        sent: t('transfer_credit.balance_transfer.amount.min'),
        complete: false,
      });
      return false;
    }

    if (amountNumber > Number(wallet || 0)) {
      setBTresponse({
        color: 'red',
        sent: t('transfer_credit.balance_transfer.amount.not_suf'),
        complete: false,
      });
      return false;
    }

    return true;
  };

  const openConfirmSheet = () => {
    const phoneValidation = validateTransferPhone();
    if (!phoneValidation) {
      return;
    }

    if (!validateAmount()) {
      return;
    }

    setBTresponse({
      color: 'green',
      sent: '',
      complete: true,
    });

    setConfirmVisible(true);
  };

  const TransferBalanceHandler = async () => {
    const phoneValidation = validateTransferPhone();
    if (!phoneValidation) {
      return;
    }

    if (!validateAmount()) {
      return;
    }

    const amountNumber = Number(tamount);

    try {
      setLoader(true);
      setBTresponse({
        color: 'green',
        sent: '',
        complete: false,
      });

      const response = await api.post('/transfer-balanc', {
        tphone: phoneValidation.fullPhone,
        tamount: amountNumber,
        country_key: selectedCountry.id,
      });

      if (response?.data === 'done') {
        dispatch({
          type: UPDATE_CREDIT,
          payload: Number(wallet) - Number(amountNumber),
        });

        setConfirmVisible(false);
        setTphone('');
        setTamount('');
        setVisible(true)
     
      } else if (response?.data === 'phonenot') {
        setBTresponse({
          color: 'red',
          sent: t('transfer_credit.balance_transfer.phone.notfound'),
          complete: false,
        });
        setConfirmVisible(false);
      } else if (response?.data === 'walletnot') {
        setBTresponse({
          color: 'red',
          sent: t('transfer_credit.balance_transfer.amount.not_suf'),
          complete: false,
        });
        setConfirmVisible(false);
      } else {
        setBTresponse({
          color: 'red',
          sent: t('transfer_credit.balance_transfer.general_error'),
          complete: false,
        });
        setConfirmVisible(false);
      }
    } catch (error) {
      setBTresponse({
        color: 'red',
        sent: t('transfer_credit.balance_transfer.general_error'),
        complete: false,
      });
      setConfirmVisible(false);
    } finally {
      setLoader(false);
    }
  };

  const phoneHasError =
    !!BTresponse?.sent &&
    (BTresponse?.sent === t('transfer_credit.balance_transfer.phone.notValid') ||
      BTresponse?.sent === t('transfer_credit.balance_transfer.phone.yourselfnot') ||
      BTresponse?.sent === t('transfer_credit.balance_transfer.phone.notfound'));

  const amountHasError =
    !!BTresponse?.sent &&
    (BTresponse?.sent === t('transfer_credit.balance_transfer.amount.min') ||
      BTresponse?.sent === t('transfer_credit.balance_transfer.amount.not_suf'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <AppHeader
              titleKey="transfer_credit.balance_transfer.title"
              onBack={() => navigation.goBack()}
            />

            <AppText style={styles.helperText}>
              {t('transfer_credit.balance_transfer.helper')}
            </AppText>

            <AppText style={styles.label}>
              {t('transfer_credit.balance_transfer.phone.label')}
            </AppText>

            <View
              style={[
                styles.phoneWrapper,
                phoneHasError && styles.phoneWrapperError,
              ]}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.phoneCountryBox}
                onPress={() => setIsSheetVisible(true)}>
                <Image
                  source={selectedCountry.flag}
                  style={styles.flag}
                  resizeMode="cover"
                />
                <AppText style={styles.countryCode}>
                  {selectedCountry.code}
                </AppText>
              </TouchableOpacity>

              <View style={styles.phoneInputArea}>
                <TextInput
                  value={tphone}
                  onChangeText={value => {
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setTphone(numericValue);
                    clearResponse();
                  }}
                  placeholder={t('transfer_credit.balance_transfer.phone.placeholder')}
                  placeholderTextColor="#A9A9A9"
                  keyboardType="phone-pad"
                  style={[
                    styles.phoneInput,
                    {fontFamily, textAlign: isRTL ? 'right' : 'left'},
                  ]}
                  maxLength={(selectedCountry?.length || 10) + 1}
                />

                {phoneHasError ? (
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#FF5C5C"
                  />
                ) : null}
              </View>
            </View>

            {phoneHasError ? (
              <AppText style={styles.errorText}>{BTresponse.sent}</AppText>
            ) : null}

            <AppText style={styles.label}>
              {t('transfer_credit.balance_transfer.amount.label')}
            </AppText>

            <View
              style={[
                styles.amountWrapper,
                amountHasError && styles.phoneWrapperError,
              ]}>
              <TextInput
                value={tamount}
                onChangeText={value => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setTamount(numericValue);
                  clearResponse();
                }}
                placeholder={t('transfer_credit.balance_transfer.amount.placeholder')}
                placeholderTextColor="#A9A9A9"
                keyboardType="number-pad"
                style={[
                  styles.amountInput,
                  {fontFamily, textAlign: isRTL ? 'right' : 'left'},
                ]}
              />
            </View>

            {amountHasError ? (
              <AppText style={styles.errorText}>{BTresponse.sent}</AppText>
            ) : null}
          </ScrollView>


       

          <View style={styles.bottomButtonWrap}>
            <AppButton
              title={loader ? '' : t('transfer_credit.balance_transfer.submit')}
              onPress={openConfirmSheet}
              disabled={loader}>
              {loader ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : null}
            </AppButton>
          </View>

          <Modal
            transparent
            visible={confirmVisible}
            animationType="fade"
            onRequestClose={() => setConfirmVisible(false)}>
            <Pressable
              style={styles.sheetOverlay}
              onPress={() => setConfirmVisible(false)}>
              <Pressable style={styles.sheetContainer} onPress={() => {}}>
                <View style={styles.sheetHandle} />

                <AppText weight="bold" style={styles.sheetTitle}>
                  {t('transfer_credit.balance_transfer.confirm_title')}
                </AppText>

                <AppText style={styles.sheetDescription}>
                  {t('transfer_credit.balance_transfer.confirm_message', {
                    amount: amountText,
                    phone: `${selectedCountry.code}${normalizeLocalPhone(tphone)}`,
                  })}
                </AppText>

                <View style={styles.sheetButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.confirmButton}
                    onPress={TransferBalanceHandler}
                    disabled={loader}>
                    {loader ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <AppText weight="bold" style={styles.confirmButtonText}>
                        {t('transfer_credit.balance_transfer.submit')}
                      </AppText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.cancelButton}
                    onPress={() => setConfirmVisible(false)}
                    disabled={loader}>
                    <AppText weight="bold" style={styles.cancelButtonText}>
                      {t('transfer_credit.cancel')}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

          <CountryBottomSheet
            visible={isSheetVisible}
            onClose={() => setIsSheetVisible(false)}
            onSelect={country => {
              setSelectedCountry(country);
              setBTresponse({
                color: 'red',
                sent: '',
                complete: false,
              });
            }}
          />
        </View>
      </KeyboardAvoidingView>

       <Snackbar
        visible={visible}
         
        onDismiss={() => setVisible(false)}
        action={{
          label: t('transfer_credit.balance_transfer.done'),
          onPress: () => {
            // Do something
          },
        }}>
      {t('transfer_credit.balance_transfer.done_sen')}
      </Snackbar>
    </SafeAreaView>
  );
};

export default TransferBalanceScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },

  helperText: {
    fontSize: 14,
    color: '#8D8D8D',
    lineHeight: 22,
    textAlign: 'auto',
    marginTop: 10,
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    color: '#2A2A2A',
    textAlign: 'auto',
    marginBottom: 8,
    marginTop: 4,
  },

  phoneWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  phoneWrapperError: {
    borderColor: '#FF5C5C',
  },
  phoneCountryBox: {
    width: 74,
    backgroundColor: '#E9E9E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    width: 22,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    color: '#7B7B7B',
  },
  phoneInputArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F1F1F',
    paddingVertical: 0,
  },

  amountWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F1F1F',
    paddingVertical: 0,
  },

  errorText: {
    fontSize: 12,
    color: '#FF5C5C',
    textAlign: 'auto',
    marginTop: 6,
  },

  bottomButtonWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'transparent',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
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
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 24,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
  },
  sheetButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    width: '48.5%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3B97D3',
    justifyContent: 'center',
    alignItems: 'center',
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
  cancelButtonText: {
    color: '#3B97D3',
    fontSize: 15,
  },
});