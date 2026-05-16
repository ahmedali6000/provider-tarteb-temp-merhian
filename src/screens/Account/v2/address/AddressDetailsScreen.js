import React, {useMemo, useState, memo} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  I18nManager,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import useAppFont from '../../../../hooks/useAppFont';

import {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
} from '../../../../services/addressService';

import {
  UPDATE_ADRESSES_ARR,
  SELECT_MY_ADDRESS,
} from '../../../../redux/actions/ActionTypes';

const AddressInput = memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    error,
    errorKey,
    clearError,
    fontFamily,
    isRTL,
    returnKeyType = 'next',
  }) => {
    return (
      <View style={styles.inputGroup}>
        <AppText style={styles.inputLabel}>{label}</AppText>

        <TextInput
          value={value}
          onChangeText={text => {
            onChangeText(text);
            clearError(errorKey);
          }}
          placeholder={placeholder}
          placeholderTextColor="#B5B5B5"
          keyboardType={keyboardType || 'default'}
          returnKeyType={returnKeyType}
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            error && styles.inputError,
            {
              fontFamily,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        />

        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
      </View>
    );
  },
);

const AddressDetailsScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const isRTL = I18nManager.isRTL;
  const dispatch = useDispatch();

  const mode = route?.params?.mode || 'create';
  const from = route?.params?.from || 'account';
  const oldAddress = route?.params?.address || null;
  const selectedLocation = route?.params?.selectedLocation || null;
  const formData = route?.params?.formData || null;
  const returnScreen =
    route?.params?.returnScreen ||
    (from === 'order' ? 'SelectOrderAddressScreen' : 'AddressesScreen');

  const isEdit = mode === 'edit';

 const isInvalidStreetValue = value => {
  if (!value) {
    return true;
  }

  const text = String(value).trim();

  return (
    text === 'الموقع المحدد' ||
    text === 'تم تحديد الموقع على الخريطة' ||
    text === 'Location selected on map' ||
    text === t('addresses.selected_location_default')
  );
};

const getInitialStreet = () => {
  const possibleStreet =
    formData?.street ||
    selectedLocation?.street ||
    oldAddress?.street ||
    selectedLocation?.address ||
    oldAddress?.address ||
    '';

  if (isInvalidStreetValue(possibleStreet)) {
    return '';
  }

  return possibleStreet;
};

  const [type, setType] = useState(formData?.type || oldAddress?.type || 'home');

  const [placeKind, setPlaceKind] = useState(
    formData?.placeKind || oldAddress?.place_kind || 'flat',
  );

  const [latitude] = useState(
    selectedLocation?.latitude || oldAddress?.latitude || '',
  );

  const [longitude] = useState(
    selectedLocation?.longitude || oldAddress?.longitude || '',
  );

  const [address] = useState(
    selectedLocation?.address || oldAddress?.address || '',
  );

  const [street, setStreet] = useState(getInitialStreet);

  const [buildingNum, setBuildingNum] = useState(
    formData?.buildingNum || oldAddress?.building_num || '',
  );

  const [flatNum, setFlatNum] = useState(
    formData?.flatNum || oldAddress?.flat_num || '',
  );

  const [floorNum, setFloorNum] = useState(
    formData?.floorNum || oldAddress?.floor_num || '',
  );

  const [alternativePhone, setAlternativePhone] = useState(
    formData?.alternativePhone || oldAddress?.alternative_phone || '',
  );

  const [distinctiveMark, setDistinctiveMark] = useState(
    formData?.distinctiveMark || oldAddress?.distinctive_mark || '',
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);

  const payload = useMemo(
    () => ({
      type,
      place_kind: placeKind,
      latitude,
      longitude,
      address,
      street: street.trim(),
      building_num: buildingNum.trim(),
      flat_num: flatNum.trim(),
      floor_num: floorNum.trim(),
      alternative_phone: alternativePhone.trim(),
      distinctive_mark: distinctiveMark.trim(),
      area_id: selectedLocation?.area_id || oldAddress?.area_id || null,
      gov_id: selectedLocation?.gov_id || oldAddress?.gov_id || null,
    }),
    [
      type,
      placeKind,
      latitude,
      longitude,
      address,
      street,
      buildingNum,
      flatNum,
      floorNum,
      alternativePhone,
      distinctiveMark,
      selectedLocation,
      oldAddress,
    ],
  );

  const clearError = key => {
    if (errors[key] || errors.api) {
      setErrors(prev => ({
        ...prev,
        [key]: undefined,
        api: undefined,
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!latitude || !longitude) {
      nextErrors.location = t('addresses.validation.location_required');
    }

    if (!street.trim()) {
      nextErrors.street = t('addresses.validation.street_required');
    }

    if (!buildingNum.trim()) {
      nextErrors.buildingNum = t('addresses.validation.building_required');
    }

    if (placeKind === 'flat' && !flatNum.trim()) {
      nextErrors.flatNum = t('addresses.validation.flat_required');
    }

    if (!floorNum.trim() && placeKind !== 'villa') {
      nextErrors.floorNum = t('addresses.validation.floor_required');
    }

    if (alternativePhone.trim()) {
      const phoneOnly = alternativePhone.replace(/\s/g, '');

      if (phoneOnly.length < 10) {
        nextErrors.alternativePhone = t('addresses.validation.phone_invalid');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openMapToEditLocation = () => {
    Keyboard.dismiss();

    navigation.navigate('PickAddressMapScreen', {
      mode,
      from,
      returnScreen,
      address: oldAddress,
      formData: {
        type,
        placeKind,
        street,
        buildingNum,
        flatNum,
        floorNum,
        alternativePhone,
        distinctiveMark,
      },
      initialLocation: {
        latitude,
        longitude,
        address,
        street,
      },
    });
  };

  const getSavedAddressFromResponse = (saveResponse, nextAddresses) => {
    const savedAddressId =
      saveResponse?.data?.id ||
      saveResponse?.address?.id ||
      saveResponse?.data?.data?.id ||
      saveResponse?.id ||
      oldAddress?.id;

    if (savedAddressId) {
      const foundAddress = nextAddresses.find(
        item => String(item.id) === String(savedAddressId),
      );

      if (foundAddress) {
        return foundAddress;
      }
    }

    if (isEdit && oldAddress?.id) {
      const editedAddress = nextAddresses.find(
        item => String(item.id) === String(oldAddress.id),
      );

      if (editedAddress) {
        return editedAddress;
      }
    }

    return nextAddresses[0] || null;
  };

  const saveAddress = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let saveResponse = null;

      if (isEdit) {
        saveResponse = await updateAddress(oldAddress.id, payload);
      } else {
        saveResponse = await createAddress(payload);
      }

      const addressesResponse = await getAddresses();
      const nextAddresses = addressesResponse?.data || [];

      dispatch({
        type: UPDATE_ADRESSES_ARR,
        payload: nextAddresses,
      });

      const savedAddress = getSavedAddressFromResponse(
        saveResponse,
        nextAddresses,
      );

      if (savedAddress) {
        dispatch({
          type: SELECT_MY_ADDRESS,
          payload: savedAddress,
        });
      }

      if (from === 'register') {
        navigation.reset({
          index: 0,
          routes: [{name: 'HomeTabs'}],
        });
        return;
      }

      if (from === 'order') {
        navigation.navigate(returnScreen, {
          selectedAddress: savedAddress,
          openSheetOnStart: false,
        });
        return;
      }

      navigation.navigate('AddressesScreen');
    } catch (error) {
      console.log(
        'SAVE ADDRESS ERROR:',
        error?.response?.data || error?.message,
      );

      setErrors(prev => ({
        ...prev,
        api: t('addresses.validation.general_error'),
      }));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!oldAddress?.id) {
      return;
    }

    try {
      setLoading(true);

      await deleteAddress(oldAddress.id);

      const addressesResponse = await getAddresses();
      const nextAddresses = addressesResponse?.data || [];

      dispatch({
        type: UPDATE_ADRESSES_ARR,
        payload: nextAddresses,
      });

      setDeleteSheet(false);

      if (from === 'order') {
        const nextSelectedAddress = nextAddresses[0] || null;

        if (nextSelectedAddress) {
          dispatch({
            type: SELECT_MY_ADDRESS,
            payload: nextSelectedAddress,
          });
        }

        navigation.navigate(returnScreen, {
          selectedAddress: nextSelectedAddress,
          openSheetOnStart: false,
        });

        return;
      }

      navigation.navigate('AddressesScreen');
    } catch (error) {
      console.log(
        'DELETE ADDRESS ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const typeItems = [
    {key: 'home', label: t('addresses.home'), icon: 'home'},
    {key: 'work', label: t('addresses.work'), icon: 'business'},
    {key: 'other', label: t('addresses.other'), icon: 'location'},
  ];

  const kindItems = [
    {key: 'flat', label: t('addresses.flat')},
    {key: 'office', label: t('addresses.office')},
    {key: 'villa', label: t('addresses.villa')},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="addresses.details_title"
          onBack={() => navigation.goBack()}
        />

        {isEdit ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.trashButton}
            onPress={() => setDeleteSheet(true)}>
            <Ionicons name="trash" size={22} color="#EF1717" />
          </TouchableOpacity>
        ) : null}

        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 110}
          contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.locationCard,
              errors.location && styles.locationCardError,
            ]}
            onPress={openMapToEditLocation}>
            <View style={styles.mapBackground}>
              <View style={[styles.road, styles.roadOne]} />
              <View style={[styles.road, styles.roadTwo]} />
              <View style={[styles.mapBlock, styles.mapBlockOne]} />
              <View style={[styles.mapBlock, styles.mapBlockTwo]} />
              <View style={[styles.mapBlock, styles.mapBlockThree]} />
            </View>

            <Ionicons
              name="location"
              size={46}
              color="#F41818"
              style={styles.pin}
            />

            <View style={styles.mapFooter}>
              <View style={styles.mapFooterText}>
                <AppText style={styles.mapLabel}>
                  {t('addresses.address')}
                </AppText>

                <AppText
                  weight="medium"
                  style={styles.mapAddress}
                  numberOfLines={1}>
                  {address || t('addresses.pick_location')}
                </AppText>
              </View>

              <View style={styles.mapEditRow}>
                <Ionicons name="location" size={14} color="#F28A1A" />

                <AppText weight="bold" style={styles.mapEditText}>
                  {t('addresses.edit')}
                </AppText>
              </View>
            </View>
          </TouchableOpacity>

          {errors.location ? (
            <AppText style={styles.errorText}>{errors.location}</AppText>
          ) : null}

          <AppText weight="bold" style={styles.sectionTitle}>
            {t('addresses.address_name')}
          </AppText>

          <View style={styles.typeRow}>
            {typeItems.map(item => {
              const active = type === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.85}
                  onPress={() => setType(item.key)}
                  style={[styles.typeButton, active && styles.typeButtonActive]}>
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={active ? '#3296D9' : '#111'}
                  />

                  <AppText
                    weight={active ? 'bold' : 'regular'}
                    style={[
                      styles.typeButtonText,
                      active && styles.typeButtonTextActive,
                    ]}>
                    {item.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.kindRow}>
            {kindItems.map(item => {
              const active = placeKind === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.85}
                  style={styles.kindButton}
                  onPress={() => {
                    setPlaceKind(item.key);
                    clearError('flatNum');
                    clearError('floorNum');
                  }}>
                  <AppText
                    weight={active ? 'bold' : 'regular'}
                    style={[styles.kindText, active && styles.kindTextActive]}>
                    {item.label}
                  </AppText>

                  {active ? <View style={styles.kindLine} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <AddressInput
            label={t('addresses.street')}
            value={street}
            onChangeText={setStreet}
            placeholder={t('addresses.street_placeholder')}
            error={errors.street}
            errorKey="street"
            clearError={clearError}
            fontFamily={fontFamily}
            isRTL={isRTL}
          />

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <AddressInput
                label={t('addresses.building_num')}
                value={buildingNum}
                onChangeText={setBuildingNum}
                placeholder={t('addresses.building_num_placeholder')}
                error={errors.buildingNum}
                errorKey="buildingNum"
                clearError={clearError}
                fontFamily={fontFamily}
                isRTL={isRTL}
              />
            </View>

            <View style={styles.column}>
              <AddressInput
                label={
                  placeKind === 'office'
                    ? t('addresses.office_num')
                    : placeKind === 'villa'
                    ? t('addresses.villa_num')
                    : t('addresses.flat_num')
                }
                value={flatNum}
                onChangeText={setFlatNum}
                placeholder={
                  placeKind === 'office'
                    ? t('addresses.office_num_placeholder')
                    : placeKind === 'villa'
                    ? t('addresses.villa_num_placeholder')
                    : t('addresses.flat_num_placeholder')
                }
                error={errors.flatNum}
                errorKey="flatNum"
                clearError={clearError}
                fontFamily={fontFamily}
                isRTL={isRTL}
              />
            </View>
          </View>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <AddressInput
                label={t('addresses.floor_num')}
                value={floorNum}
                onChangeText={setFloorNum}
                placeholder={t('addresses.floor_num_placeholder')}
                error={errors.floorNum}
                errorKey="floorNum"
                clearError={clearError}
                fontFamily={fontFamily}
                isRTL={isRTL}
              />
            </View>

            <View style={styles.column}>
              <AddressInput
                label={t('addresses.alternative_phone')}
                value={alternativePhone}
                onChangeText={setAlternativePhone}
                placeholder={t('addresses.alternative_phone_placeholder')}
                keyboardType="phone-pad"
                error={errors.alternativePhone}
                errorKey="alternativePhone"
                clearError={clearError}
                fontFamily={fontFamily}
                isRTL={isRTL}
                returnKeyType="done"
              />
            </View>
          </View>

          <AddressInput
            label={t('addresses.distinctive_mark')}
            value={distinctiveMark}
            onChangeText={setDistinctiveMark}
            placeholder={t('addresses.distinctive_mark_placeholder')}
            error={errors.distinctiveMark}
            errorKey="distinctiveMark"
            clearError={clearError}
            fontFamily={fontFamily}
            isRTL={isRTL}
            returnKeyType="done"
          />

          {errors.api ? (
            <View style={styles.apiErrorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />

              <AppText style={styles.apiErrorText}>{errors.api}</AppText>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
            onPress={saveAddress}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AppText weight="bold" style={styles.saveButtonText}>
                {t('addresses.save')}
              </AppText>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>

        <Modal
          visible={deleteSheet}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteSheet(false)}>
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setDeleteSheet(false)}>
            <Pressable style={styles.deleteSheet} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              <AppText weight="bold" style={styles.deleteTitle}>
                {t('addresses.delete_title')}
              </AppText>

              <AppText style={styles.deleteDesc}>
                {t('addresses.delete_desc')}
              </AppText>

              <View style={styles.deleteActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.deleteButton}
                  disabled={loading}
                  onPress={confirmDelete}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <AppText weight="bold" style={styles.deleteButtonText}>
                      {t('addresses.delete')}
                    </AppText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelButton}
                  disabled={loading}
                  onPress={() => setDeleteSheet(false)}>
                  <AppText weight="bold" style={styles.cancelButtonText}>
                    {t('addresses.cancel')}
                  </AppText>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default AddressDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 38,
  },
  trashButton: {
    position: 'absolute',
    end: 16,
    top: 22,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    height: 146,
    marginTop: 14,
    backgroundColor: '#E8EEF3',
    overflow: 'hidden',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  locationCardError: {
    borderColor: '#EF4444',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  road: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
  },
  roadOne: {
    width: '120%',
    height: 28,
    top: 42,
    end: -25,
    transform: [{rotate: '-8deg'}],
  },
  roadTwo: {
    width: 34,
    height: '120%',
    top: -20,
    right: 78,
    transform: [{rotate: '8deg'}],
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: '#D6DEE7',
    borderRadius: 5,
  },
  mapBlockOne: {
    width: 70,
    height: 42,
    top: 12,
    left: 18,
  },
  mapBlockTwo: {
    width: 82,
    height: 50,
    top: 16,
    right: 18,
  },
  mapBlockThree: {
    width: 86,
    height: 44,
    bottom: 54,
    left: 62,
  },
  pin: {
    position: 'absolute',
    alignSelf: 'center',
    top: 38,
  },
  mapFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 50,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapFooterText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  mapLabel: {
    fontSize: 11,
    color: '#9A9A9A',
    marginBottom: 3,
  },
  mapAddress: {
    fontSize: 12,
    color: '#1F1F1F',
    textAlign: 'auto',
  },
  mapEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: 10,
  },
  mapEditText: {
    fontSize: 13,
    color: '#F28A1A',
    marginStart: 3,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'auto',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    width: '31%',
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FD',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#111111',
    marginStart: 5,
  },
  typeButtonTextActive: {
    color: '#3296D9',
  },
  kindRow: {
    marginTop: 16,
    height: 42,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  kindButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  kindText: {
    fontSize: 13,
    color: '#9A9A9A',
    marginBottom: 9,
  },
  kindTextActive: {
    color: '#1F1F1F',
  },
  kindLine: {
    height: 2,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#3296D9',
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: '#4A4A4A',
    textAlign: 'auto',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1F1F1F',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    marginTop: 6,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'auto',
  },
  twoColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  apiErrorBox: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  apiErrorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'auto',
    marginStart: 6,
  },
  saveButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
  },
  deleteSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 8,
    backgroundColor: '#D5D5D5',
    alignSelf: 'center',
    marginBottom: 18,
  },
  deleteTitle: {
    fontSize: 22,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  deleteDesc: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    width: '48%',
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EF1717',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  cancelButton: {
    width: '48%',
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#3296D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#3296D9',
    fontSize: 14,
  },
});