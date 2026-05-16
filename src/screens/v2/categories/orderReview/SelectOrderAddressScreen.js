import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
  I18nManager,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';

import {
  SELECT_MY_ADDRESS,
  UPDATE_ADRESSES_ARR,
} from '../../../../redux/actions/ActionTypes';

import {getAddresses} from '../../../../services/addressService';

const {height} = Dimensions.get('window');

const MAIN_COLOR = '#3296D9';

const DEFAULT_REGION = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

const SelectOrderAddressScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const mapRef = useRef(null);

  const addresses = useSelector(state => state.auth.addresses || []);
  const selectedAddress = useSelector(state => state.auth.my_selected_address);

  const routeSelectedAddress = route?.params?.selectedAddress || null;
  const openSheetOnStart = route?.params?.openSheetOnStart !== false;

  

  const [sheetVisible, setSheetVisible] = useState(false);
  const [firstSheetOpenDone, setFirstSheetOpenDone] = useState(false);
  const [tempAddress, setTempAddress] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const cameBackFromAddressFlow = !!routeSelectedAddress?.id;

  const getAddressLat = item => {
    return Number(item?.latitude || item?.lat || item?.location?.latitude);
  };

  const getAddressLng = item => {
    return Number(item?.longitude || item?.lng || item?.location?.longitude);
  };

  const getAddressText = item => {
    return (
      item?.address ||
      item?.street ||
      item?.description ||
      t('addresses.no_address') ||
      'لا يوجد عنوان'
    );
  };

  const getAddressTypeText = item => {
    if (item?.type_label) {
      return item.type_label;
    }

    if (item?.type === 'home') {
      return t('addresses.home') || 'المنزل';
    }

    if (item?.type === 'work') {
      return t('addresses.work') || 'العمل';
    }

    return t('addresses.other') || 'أخرى';
  };

  const getAddressIcon = type => {
    if (type === 'home') {
      return 'home';
    }

    if (type === 'work') {
      return 'business';
    }

    return 'location';
  };

  const setSelectedAddressSafely = useCallback(
    addressItem => {
      if (!addressItem) {
        setTempAddress(null);
        return;
      }

      setTempAddress(addressItem);

      dispatch({
        type: SELECT_MY_ADDRESS,
        payload: addressItem,
      });
    },
    [dispatch],
  );

  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);

      const response = await getAddresses();
      const nextAddresses = response?.data || [];

      dispatch({
        type: UPDATE_ADRESSES_ARR,
        payload: nextAddresses,
      });

      if (routeSelectedAddress?.id) {
        const foundAddress =
          nextAddresses.find(
            item => String(item.id) === String(routeSelectedAddress.id),
          ) || routeSelectedAddress;

        setSelectedAddressSafely(foundAddress);
        setSheetVisible(false);
        setFirstSheetOpenDone(true);

        navigation.setParams({
          selectedAddress: undefined,
          openSheetOnStart: false,
        });

        return;
      }

      if (selectedAddress?.id) {
        const foundSelected =
          nextAddresses.find(
            item => String(item.id) === String(selectedAddress.id),
          ) || selectedAddress;

        setTempAddress(foundSelected);
        return;
      }

      if (nextAddresses.length > 0) {
        setTempAddress(nextAddresses[0]);
      }
    } catch (error) {
      console.log(
        'SELECT ORDER ADDRESS FETCH ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoadingAddresses(false);
    }
  }, [
    dispatch,
    navigation,
    routeSelectedAddress,
    selectedAddress,
    setSelectedAddressSafely,
  ]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses]),
  );

  useEffect(() => {
    if (cameBackFromAddressFlow) {
      return;
    }

    if (firstSheetOpenDone) {
      return;
    }

    if (!openSheetOnStart) {
      return;
    }

    setFirstSheetOpenDone(true);

    setTimeout(() => {
      setSheetVisible(true);
    }, 250);
  }, [cameBackFromAddressFlow, firstSheetOpenDone, openSheetOnStart]);

  useEffect(() => {
    if (routeSelectedAddress?.id) {
      setSelectedAddressSafely(routeSelectedAddress);
      setSheetVisible(false);
      setFirstSheetOpenDone(true);
      return;
    }

    const firstAddress = selectedAddress || addresses?.[0] || null;

    if (!tempAddress && firstAddress) {
      setTempAddress(firstAddress);
    }
  }, [
    routeSelectedAddress,
    selectedAddress,
    addresses,
    tempAddress,
    setSelectedAddressSafely,
  ]);

  const currentRegion = useMemo(() => {
    const lat = getAddressLat(tempAddress);
    const lng = getAddressLng(tempAddress);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };
    }

    return DEFAULT_REGION;
  }, [tempAddress]);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    setTimeout(() => {
      mapRef.current?.animateToRegion(currentRegion, 350);
    }, 80);
  }, [currentRegion, mapReady]);

  const hasSelectedAddress = !!tempAddress;

  const isActiveAddress = item => {
    return String(item?.id) === String(tempAddress?.id);
  };

  const selectAddress = item => {
    setTempAddress(item);
  };

  const openAddAddress = () => {
    setSheetVisible(false);

    navigation.navigate('PickAddressMapScreen', {
      mode: 'create',
      from: 'order',
      returnScreen: 'SelectOrderAddressScreen',
    });
  };

  const openEditAddress = item => {
    setSheetVisible(false);

    navigation.navigate('PickAddressMapScreen', {
      mode: 'edit',
      from: 'order',
      returnScreen: 'SelectOrderAddressScreen',
      address: item,
      initialLocation: {
        latitude: item?.latitude,
        longitude: item?.longitude,
        address: item?.address || item?.street || '',
        street: item?.street || item?.address || '',
      },
    });
  };

  const confirmAddress = () => {
    if (!tempAddress) {
      return;
    }

    dispatch({
      type: SELECT_MY_ADDRESS,
      payload: tempAddress,
    });

    setSheetVisible(false);

    navigation.navigate('OrderScheduleTypeScreen', {
      selectedAddress: tempAddress,
    });
  };

  const renderMap = () => {
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          googleRenderer="LEGACY"
          style={StyleSheet.absoluteFillObject}
          initialRegion={currentRegion}
          onMapReady={() => setMapReady(true)}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          showsUserLocation={false}
          showsMyLocationButton={false}>
          <Marker
            coordinate={{
              latitude: currentRegion.latitude,
              longitude: currentRegion.longitude,
            }}
            pinColor="red"
          />
        </MapView>

        <View style={styles.searchPreview}>
          <Ionicons name="location-outline" size={18} color={MAIN_COLOR} />

          <AppText numberOfLines={1} style={styles.searchPreviewText}>
            {hasSelectedAddress
              ? getAddressText(tempAddress)
              : t('addresses.choose_address') || 'اختر عنوان التوصيل'}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.changeSmallButton}
            onPress={() => setSheetVisible(true)}>
            <AppText weight="bold" style={styles.changeSmallText}>
              {t('addresses.change') || 'تغيير'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddressItem = item => {
    const active = isActiveAddress(item);

    return (
      <TouchableOpacity
        key={String(item.id)}
        activeOpacity={0.9}
        onPress={() => selectAddress(item)}
        style={[styles.addressCard, active && styles.addressCardActive]}>
        <View style={styles.addressTopRow}>
          <View style={styles.typeBadge}>
            <Ionicons
              name={getAddressIcon(item?.type)}
              size={13}
              color={MAIN_COLOR}
            />

            <AppText weight="medium" style={styles.typeText}>
              {getAddressTypeText(item)}
            </AppText>

            {active ? (
              <Ionicons name="checkmark-circle" size={15} color={MAIN_COLOR} />
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => openEditAddress(item)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <AppText weight="bold" style={styles.editText}>
              {t('addresses.edit') || 'تعديل'}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.addressLine}>
          <Ionicons
            name="navigate-outline"
            size={15}
            color={active ? MAIN_COLOR : '#8A8A8A'}
          />

          <AppText
            weight="medium"
            numberOfLines={1}
            style={styles.addressText}>
            {getAddressText(item)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSheet = () => {
    return (
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}>
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setSheetVisible(false)}>
          <Pressable style={styles.sheetContainer} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetSide} />

              <AppText weight="bold" style={styles.sheetTitle}>
                {t('addresses.title') || 'العنوان'}
              </AppText>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addIconButton}
                onPress={openAddAddress}>
                <Ionicons name="add" size={20} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>

            {loadingAddresses ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={MAIN_COLOR} />
              </View>
            ) : addresses?.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.addressList}>
                {addresses.map(renderAddressItem)}
              </ScrollView>
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="location-outline" size={44} color="#B9D9F3" />

                <AppText weight="bold" style={styles.emptyTitle}>
                  {t('addresses.empty_title') || 'لم تقم بإضافة أي عناوين بعد'}
                </AppText>

                <AppText style={styles.emptyText}>
                  {t('addresses.empty_subtitle') ||
                    'أضف عنوانك حتى نقدر نوصلك الخدمة بسهولة'}
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.addAddressButton}
                  onPress={openAddAddress}>
                  <Ionicons name="add-circle-outline" size={18} color="#fff" />

                  <AppText weight="bold" style={styles.addAddressButtonText}>
                    {t('addresses.add_new') || 'إضافة عنوان جديد'}
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!hasSelectedAddress}
              onPress={confirmAddress}
              style={[
                styles.sheetConfirmButton,
                !hasSelectedAddress && styles.confirmButtonDisabled,
              ]}>
              <AppText weight="bold" style={styles.confirmButtonText}>
                {t('addresses.confirm_location') || 'تأكيد الموقع'}
              </AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={t('addresses.select_address') || 'حدد موقع العنوان'}
          onBack={() => navigation.goBack()}
        />

        <AppText weight="bold" style={styles.subtitleText}>
          {t('addresses.choose_address_for_order') ||
            'اختر عنوانك لتأكيد الطلب'}
        </AppText>

        {renderMap()}

        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.chooseButton}
            onPress={() => setSheetVisible(true)}>
            <Ionicons name="location-outline" size={18} color={MAIN_COLOR} />

            <AppText weight="bold" style={styles.chooseButtonText}>
              {hasSelectedAddress
                ? getAddressText(tempAddress)
                : t('addresses.choose_address') || 'اختر عنوان'}
            </AppText>

            <Ionicons
              name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color="#9A9A9A"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!hasSelectedAddress}
            onPress={confirmAddress}
            style={[
              styles.mainConfirmButton,
              !hasSelectedAddress && styles.confirmButtonDisabled,
            ]}>
            <AppText weight="bold" style={styles.confirmButtonText}>
              {t('addresses.confirm_location') || 'تأكيد الموقع'}
            </AppText>
          </TouchableOpacity>
        </View>

        {renderSheet()}
      </View>
    </SafeAreaView>
  );
};

export default SelectOrderAddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  subtitleText: {
    fontSize: 12,
    color: '#F7931E',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E9EEF3',
    overflow: 'hidden',
  },
  searchPreview: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 3},
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchPreviewText: {
    flex: 1,
    fontSize: 13,
    color: '#1F1F1F',
    textAlign: 'auto',
  },
  changeSmallButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#EEF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeSmallText: {
    fontSize: 12,
    color: MAIN_COLOR,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  chooseButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E2E3E5',
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  chooseButtonText: {
    flex: 1,
    fontSize: 13,
    color: '#1F1F1F',
    textAlign: 'auto',
  },
  mainConfirmButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    maxHeight: height * 0.48,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 20,
    backgroundColor: '#D1D1D1',
    alignSelf: 'center',
    marginBottom: 13,
  },
  sheetHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetSide: {
    width: 32,
  },
  sheetTitle: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
  },
  addIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressList: {
    paddingBottom: 4,
  },
  addressCard: {
    minHeight: 64,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E2E3E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  addressCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: MAIN_COLOR,
    borderWidth: 1.4,
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  typeText: {
    fontSize: 12,
    color: '#111111',
  },
  editText: {
    fontSize: 12,
    color: '#FF7A00',
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1F1F1F',
    lineHeight: 19,
    textAlign: 'auto',
  },
  sheetConfirmButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  emptyBox: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#111111',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 20,
    marginTop: 5,
    textAlign: 'center',
  },
  addAddressButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginTop: 14,
  },
  addAddressButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
});