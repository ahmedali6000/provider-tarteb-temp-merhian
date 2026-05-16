import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import useAppFont from '../../../../hooks/useAppFont';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCdIxg5AJYDqgJ4GGUiVjgC34hri3HSzFY';

const MAP_DELTA = {
  latitudeDelta: 0.006,
  longitudeDelta: 0.006,
};

const PickAddressMapScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const isRTL = I18nManager.isRTL;
  const mapRef = useRef(null);

  const mode = route?.params?.mode || 'create';
  const from = route?.params?.from || 'account';
  const returnScreen = route?.params?.returnScreen || 'AddressesScreen';
  const oldAddress = route?.params?.address || null;
  const formData = route?.params?.formData || null;
  const initialLocation = route?.params?.initialLocation || null;

  const editLat = Number(initialLocation?.latitude || oldAddress?.latitude);
  const editLng = Number(initialLocation?.longitude || oldAddress?.longitude);
  const hasEditLocation = Number.isFinite(editLat) && Number.isFinite(editLng);

  const [latitude, setLatitude] = useState(hasEditLocation ? editLat : null);
  const [longitude, setLongitude] = useState(hasEditLocation ? editLng : null);

  const [selectedAddress, setSelectedAddress] = useState(
    initialLocation?.address || oldAddress?.address || '',
  );

  const [selectedStreet, setSelectedStreet] = useState(
    initialLocation?.street || oldAddress?.street || '',
  );

  const [mapRegion, setMapRegion] = useState(
    hasEditLocation
      ? {
          latitude: editLat,
          longitude: editLng,
          ...MAP_DELTA,
        }
      : null,
  );

  const [checkingLocation, setCheckingLocation] = useState(!hasEditLocation);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const hasMarker = Number.isFinite(latitude) && Number.isFinite(longitude);

  useEffect(() => {
    if (hasEditLocation) {
      return;
    }

    getUserLocationFast();
  }, []);

  const getComponent = (components = [], types = []) => {
    const found = components.find(component =>
      types.some(type => component.types?.includes(type)),
    );

    return found?.long_name || '';
  };

  const parseGoogleAddress = result => {
    const components = result?.address_components || [];

    const streetNumber = getComponent(components, ['street_number']);
    const route = getComponent(components, ['route']);

    const neighborhood =
      getComponent(components, [
        'neighborhood',
        'sublocality_level_2',
        'sublocality_level_1',
        'sublocality',
      ]) || '';

    const city =
      getComponent(components, [
        'locality',
        'administrative_area_level_2',
      ]) || '';

    const gov = getComponent(components, ['administrative_area_level_1']) || '';

    const routePart = [streetNumber, route].filter(Boolean).join(' ');
    const streetParts = [routePart, neighborhood, city || gov].filter(Boolean);

    return {
      formattedAddress: result?.formatted_address || '',
      street: streetParts.join('، '),
      area: neighborhood,
      city,
      gov,
    };
  };

  const setAddressFromGoogleResult = result => {
    const parsed = parseGoogleAddress(result);

    const nextAddress =
      parsed.formattedAddress ||
      result?.formatted_address ||
      t('addresses.selected_location_default');

    const nextStreet = parsed.street || nextAddress;

    setSelectedAddress(nextAddress);
    setSelectedStreet(nextStreet);
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }

    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (alreadyGranted) {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: t('addresses.location_permission_title'),
        message: t('addresses.location_permission_message'),
        buttonPositive: t('common.ok'),
        buttonNegative: t('common.cancel'),
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getUserLocationFast = async () => {
    try {
      setCheckingLocation(true);
      setPermissionDenied(false);

      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        setPermissionDenied(true);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLocation(lat, lng, true);
        },
        error => {
          console.log('LOCATION ERROR:', error);
          setMapRegion(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      console.log('LOCATION PERMISSION ERROR:', error);
    } finally {
      setCheckingLocation(false);
    }
  };

  const setLocation = (lat, lng, shouldReverse = true) => {
    const nextLat = Number(lat);
    const nextLng = Number(lng);

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) {
      return;
    }

    const nextRegion = {
      latitude: nextLat,
      longitude: nextLng,
      ...MAP_DELTA,
    };

    setLatitude(nextLat);
    setLongitude(nextLng);
    setMapRegion(nextRegion);

    setTimeout(() => {
      mapRef.current?.animateToRegion(nextRegion, 350);
    }, 100);

    if (shouldReverse) {
      reverseGeocode(nextLat, nextLng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      setLoadingAddress(true);

      const url =
        `https://maps.googleapis.com/maps/api/geocode/json` +
        `?latlng=${lat},${lng}` +
        `&language=${isRTL ? 'ar' : 'en'}` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const json = await response.json();

      const firstResult = json?.results?.[0] || null;

      if (firstResult) {
        setAddressFromGoogleResult(firstResult);
        return;
      }

      const fallback = t('addresses.selected_location_default');
      setSelectedAddress(fallback);
      setSelectedStreet(fallback);
    } catch (error) {
      console.log('REVERSE GEOCODE ERROR:', error);

      const fallback = t('addresses.selected_location_default');
      setSelectedAddress(fallback);
      setSelectedStreet(fallback);
    } finally {
      setLoadingAddress(false);
    }
  };

  const confirmLocation = () => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    navigation.navigate('AddressDetailsScreen', {
      mode,
      from,
      returnScreen,
      address: oldAddress,
      formData,
      selectedLocation: {
        latitude,
        longitude,
        address: selectedAddress || t('addresses.selected_location_default'),
        street:
          selectedStreet ||
          selectedAddress ||
          initialLocation?.street ||
          oldAddress?.street ||
          '',
        gov_id: oldAddress?.gov_id || null,
        area_id: oldAddress?.area_id || null,
      },
    });
  };

  const renderMapContent = () => {
    if (!mapRegion) {
      return (
        <View style={styles.locationEmpty}>
          {checkingLocation ? (
            <>
              <ActivityIndicator size="large" color="#3296D9" />

              <AppText style={styles.locationEmptyText}>
                {t('addresses.detecting_location')}
              </AppText>
            </>
          ) : (
            <>
              <Ionicons name="location-outline" size={58} color="#B9D9F3" />

              <AppText weight="bold" style={styles.locationEmptyTitle}>
                {permissionDenied
                  ? t('addresses.location_permission_denied')
                  : t('addresses.location_not_found')}
              </AppText>

              <AppText style={styles.locationEmptyText}>
                {t('addresses.search_or_retry_location')}
              </AppText>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.retryButton}
                onPress={getUserLocationFast}>
                <AppText weight="bold" style={styles.retryButtonText}>
                  {t('addresses.retry_location')}
                </AppText>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        googleRenderer="LEGACY"
        style={StyleSheet.absoluteFillObject}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={e => {
          const {latitude: lat, longitude: lng} = e.nativeEvent.coordinate;
          setLocation(lat, lng, true);
        }}>
        {hasMarker ? (
          <Marker
            key={`${latitude}-${longitude}`}
            draggable
            pinColor="red"
            coordinate={{
              latitude: Number(latitude),
              longitude: Number(longitude),
            }}
            onDragEnd={e => {
              const {latitude: lat, longitude: lng} = e.nativeEvent.coordinate;
              setLocation(lat, lng, true);
            }}
          />
        ) : null}
      </MapView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="addresses.select_location"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.mapContainer}>{renderMapContent()}</View>

        <View style={styles.searchWrapper}>
          <GooglePlacesAutocomplete
            placeholder={t('addresses.search_area')}
            fetchDetails
            enablePoweredByContainer={false}
            debounce={300}
            minLength={2}
            timeout={15000}
            onFail={error => console.log('PLACES ERROR:', error)}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: isRTL ? 'ar' : 'en',
              components: 'country:eg',
            }}
            onPress={(data, details = null) => {
              const lat = details?.geometry?.location?.lat;
              const lng = details?.geometry?.location?.lng;

              if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
                if (details) {
                  setAddressFromGoogleResult(details);
                } else {
                  const fallback = data?.description || '';
                  setSelectedAddress(fallback);
                  setSelectedStreet(fallback);
                }

                setLocation(lat, lng, false);
              }
            }}
            textInputProps={{
              placeholderTextColor: '#8A8A8A',
              textAlign: isRTL ? 'right' : 'left',
            }}
            styles={{
              container: styles.placesContainer,
              textInputContainer: styles.placesInputContainer,
              textInput: [
                styles.placesInput,
                {
                  fontFamily,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ],
              listView: styles.placesList,
              row: styles.placeRow,
              description: {
                fontFamily,
                color: '#1F1F1F',
                textAlign: isRTL ? 'right' : 'left',
              },
            }}
            renderLeftButton={() => (
              <View style={styles.searchIconBox}>
                <Ionicons name="search-outline" size={20} color="#777" />
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.currentLocationBtn}
          onPress={getUserLocationFast}>
          {checkingLocation ? (
            <ActivityIndicator size="small" color="#3296D9" />
          ) : (
            <Ionicons name="locate-outline" size={22} color="#3296D9" />
          )}
        </TouchableOpacity>

        <View style={styles.bottomCard}>
          <View style={styles.addressPreview}>
            <AppText style={styles.addressLabel}>
              {t('addresses.address')}
            </AppText>

            <AppText weight="medium" style={styles.addressText} numberOfLines={2}>
              {loadingAddress
                ? t('addresses.loading_address')
                : selectedAddress || t('addresses.pick_location')}
            </AppText>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.confirmButton,
              !hasMarker && styles.confirmButtonDisabled,
            ]}
            onPress={confirmLocation}
            disabled={loadingAddress || !hasMarker}>
            {loadingAddress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText weight="bold" style={styles.confirmButtonText}>
                {t('addresses.confirm_location')}
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PickAddressMapScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 8,
  },
  mapContainer: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#F5F5F5',
  },
  locationEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  locationEmptyTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    marginTop: 12,
    textAlign: 'center',
  },
  locationEmptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3296D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  searchWrapper: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 999,
  },
  placesContainer: {
    flex: 0,
    zIndex: 999,
    elevation: 999,
  },
  placesInputContainer: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  placesInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1F1F1F',
    backgroundColor: '#FFFFFF',
    paddingVertical: 0,
  },
  searchIconBox: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placesList: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 999,
    zIndex: 999,
  },
  placeRow: {
    paddingVertical: 12,
  },
  currentLocationBtn: {
    position: 'absolute',
    right: 18,
    bottom: 170,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  bottomCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  addressPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  addressLabel: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'right',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'right',
    lineHeight: 22,
  },
  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#B8D9EE',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});