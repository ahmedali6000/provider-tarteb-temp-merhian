import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TextInput,
  TouchableOpacity, FlatList, Alert, Platform, Image,
  SafeAreaView, KeyboardAvoidingView, Linking, Modal, Keyboard
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { backgroundColorHadytop, btnColor, btnColorDark, domain, GOOGLE_MAPS_KEY } from '../../utils/app';
import HeaderApp from '../../shared/Header';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import { SELECT_MY_ADDRESS } from '../../redux/actions/ActionTypes';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

const { width } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 30.0444,
  longitude: 31.2357,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function LocationSelectScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const tokenK = useSelector(state => state.auth.token);
  const { t } = useTranslation();

  const [region, setRegion] = useState(DEFAULT_REGION);
  const [showLoader, setShowLoader] = useState(true);

  const [address, setAddress] = useState(''); // ما يراه المستخدم في الحقل
  const [locationAddress, setLocationAddress] = useState(''); // العنوان من GPS
  const [isManual, setIsManual] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // server error handling
  const [serverErrorMessage, setServerErrorMessage] = useState(null);
  const [supportedGovs, setSupportedGovs] = useState([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  // selected gov/area extracted from Google results
  const [selectedGov, setSelectedGov] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    checkAndRequestPermission();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------- permissions & get location ----------------
  const checkAndRequestPermission = async () => {
    setShowLoader(true);
    try {
      const permission = Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        setPermissionGranted(true);
        await iosRequestAuthorizationIfNeeded();
        getCurrentLocation();
        return;
      }

      if (status === RESULTS.DENIED) {
        const req = await request(permission);
        if (req === RESULTS.GRANTED) {
          setPermissionGranted(true);
          await iosRequestAuthorizationIfNeeded();
          getCurrentLocation();
        } else {
          setPermissionGranted(false);
          setShowLoader(false);
        }
        return;
      }

      if (status === RESULTS.BLOCKED) {
        setPermissionGranted(false);
        Alert.alert(
          t('permission.required') || 'مطلوب إذن الموقع',
          t('permission.open_settings') || 'رجاءً فعّل إذن الموقع من إعدادات التطبيق',
          [
            { text: t('open_settings') || 'فتح الإعدادات', onPress: () => openSettings() },
            { text: t('cancel') || 'إلغاء', style: 'cancel' }
          ]
        );
        setShowLoader(false);
        return;
      }

      const rr = await request(permission);
      if (rr === RESULTS.GRANTED) {
        setPermissionGranted(true);
        await iosRequestAuthorizationIfNeeded();
        getCurrentLocation();
      } else {
        setPermissionGranted(false);
        setShowLoader(false);
      }
    } catch (err) {
      console.warn('Permission check error', err);
      setShowLoader(false);
    }
  };

  const iosRequestAuthorizationIfNeeded = async () => {
    try {
      if (Platform.OS === 'ios' && Geolocation.requestAuthorization) {
        Geolocation.requestAuthorization('whenInUse');
      }
    } catch (e) { /* ignore */ }
  };

  const getCurrentLocation = () => {
    setShowLoader(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
          setRegion(newRegion);
          await fetchAddress(latitude, longitude);
          setPermissionGranted(true);
        } catch (err) {
          console.warn('getCurrentLocation inner error', err);
        } finally {
          setShowLoader(false);
        }
      },
      (error) => {
        console.warn('Geolocation error', error);
        setShowLoader(false);
        if (error.code === 1) {
          Alert.alert(
            t('permission.required') || 'مطلوب إذن الموقع',
            t('permission.open_settings') || 'رجاءً فعّل إذن الموقع من إعدادات التطبيق',
            [
              { text: t('open_settings') || 'فتح الإعدادات', onPress: () => openSettings() },
              { text: t('cancel') || 'إلغاء', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            t('gps.off') || 'خدمات الموقع مغلقة',
            t('gps.turn_on') || 'يرجى تفعيل GPS/خدمات الموقع أو أدخل العنوان يدوياً',
            [
              { text: t('open_settings') || 'فتح إعدادات التطبيق', onPress: () => openSettings() },
              { text: t('cancel') || 'إلغاء', style: 'cancel' }
            ]
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // -------------- helper: extract gov + area from address_components ----------------
  const extractGovAndArea = (addressComponents = []) => {
    let gov = null;
    let area = null;

    addressComponents.forEach(comp => {
      if (comp.types && comp.types.includes('administrative_area_level_1')) {
        gov = comp.long_name || comp.short_name || gov;
      }
      // try several types for area/locality
      if (comp.types && (
        comp.types.includes('locality') ||
        comp.types.includes('sublocality') ||
        comp.types.includes('administrative_area_level_2') ||
        comp.types.includes('neighborhood')
      )) {
        // prefer longer name
        area = area || comp.long_name || comp.short_name;
      }
    });

    return { gov, area };
  };

  // -------------- reverse geocode ----------------
  const fetchAddress = async (latitude, longitude) => {
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}&language=ar`
      );
      const data = await resp.json();
      if (data.status === 'OK' && data.results && data.results.length) {
        const formatted = data.results[0].formatted_address;
        setLocationAddress(formatted);
        if (!isManual) setAddress(formatted);

        // extract gov/area
        const { gov, area } = extractGovAndArea(data.results[0].address_components || []);
        setSelectedGov(gov);
        setSelectedArea(area);
      } else {
        if (!isManual) {
          setLocationAddress('');
          setAddress('');
        }
        setSelectedGov(null);
        setSelectedArea(null);
      }
    } catch (err) {
      console.warn('fetchAddress error', err);
      if (!isManual) {
        setLocationAddress('');
        setAddress('');
      }
      setSelectedGov(null);
      setSelectedArea(null);
    }
  };

  // -------------- autocomplete (debounced) ----------------
  const fetchPredictions = (input) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const trimmed = input ? input.trim() : '';
      if (trimmed.length < 1) {
        setPredictions([]);
        setPredictionsLoading(false);
        return;
      }

      try {
        setPredictionsLoading(true);
        const { latitude, longitude } = region || DEFAULT_REGION;
        // remove country restriction to support other countries if needed; if you want to force Egypt add components=country:eg
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          trimmed
        )}&location=${latitude},${longitude}&radius=5000&key=${GOOGLE_MAPS_KEY}&language=ar`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.predictions) {
          setPredictions(data.predictions);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.warn('autocomplete error', err);
        setPredictions([]);
      } finally {
        setPredictionsLoading(false);
      }
    }, 300);
  };

  // -------------- select suggestion -> place details ----------------
  const updateLocation = async (placeId) => {
    try {
      Keyboard.dismiss();
      setPredictions([]);
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_KEY}&language=ar`
      );
      const data = await resp.json();
      if (data.status === 'OK' && data.result) {
        const { lat, lng } = data.result.geometry.location;
        const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        const formatted = data.result.formatted_address || data.result.name || '';
        setLocationAddress(formatted);
        setAddress(formatted);
        setIsManual(true);

        // extract gov/area
        const { gov, area } = extractGovAndArea(data.result.address_components || []);
        setSelectedGov(gov);
        setSelectedArea(area);

        // clear any server error since user changed address
        setServerErrorMessage(null);
        setSupportedGovs([]);
      } else {
        Alert.alert('Error', 'Error finding location details.');
      }
    } catch (err) {
      console.warn('place details error', err);
    }
  };

  // -------------- Handle server response and save ----------------
  const handleUpdate = async () => {
    try {
      const { latitude, longitude } = region || DEFAULT_REGION;

      const finalAddress = (address && address.trim().length) ? address.trim() : locationAddress;
      if (!finalAddress || finalAddress.trim() === '') {
        Alert.alert(t('alert.title') || 'تنبيه', t('location.enter_valid') || 'من فضلك اختر أو اكتب عنوانًا صالحًا.');
        return;
      }

      setShowLoader(true);

      const payload = {
        user_latitude: latitude,
        user_longitude: longitude,
        area: selectedArea || null,
        gov: selectedGov || null,
        address: finalAddress
      };

      // استخدام axios مع await عشان نتحكم في الخطأ
      const res = await axios.put(domain + '/api/update-google-maps-data', payload, {
        headers: { Authorization: 'Bearer ' + tokenK, 'Content-Type': 'application/json', Accept: 'application/json' }
      });

      // نجاح => امسح الأخطاء وتنقّل
      setServerErrorMessage(null);
      setSupportedGovs([]);

      dispatch({
        type: SELECT_MY_ADDRESS,
        payload: {
          id: 'user',
          address: finalAddress,
          latitude: latitude,
          longitude: longitude,
          area: selectedArea,
          gov: selectedGov
        },
      });
      navigation.navigate('SchedChoosing');
    } catch (err) {
      console.warn('update-google-maps-data error', err);
      // لو عندنا استجابة من السيرفر
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || 'خطأ';
        const govs = err.response.data?.supported_govs || [];
        if (status === 403 || status === 422) {
          // امنع المتابعة واظهر مودال جميل
          setServerErrorMessage(msg);
          // normalize supported govs: could be array of objects with {id,value,label,name_ar}
          const normalized = Array.isArray(govs) ? govs.map((g) => {
            return {
              id: g.id ?? g.value ?? Math.random().toString(),
              label: g.label ?? g.name_ar ?? g.name ?? (g?.label_ar ?? '')
            };
          }) : [];
          setSupportedGovs(normalized);
          setErrorModalVisible(true);
        } else {
          Alert.alert(t('error') || 'خطأ', msg);
        }
      } else {
        Alert.alert(t('error.network') || 'خطأ', t('error.network_msg') || 'حصل خطأ في الشبكة، حاول مرة أخرى.');
      }
    } finally {
      setShowLoader(false);
    }
  };

  // -------------- when user types in input ----------------
  const onChangeAddress = (text) => {
    // clear server errors when user modifies input
    if (serverErrorMessage) {
      setServerErrorMessage(null);
      setSupportedGovs([]);
    }
    setAddress(text);
    if (!text || text.trim() === '') {
      setIsManual(false);
      setPredictions([]);
      if (permissionGranted) {
        if (region && region.latitude) {
          fetchAddress(region.latitude, region.longitude);
        } else {
          getCurrentLocation();
        }
      }
    } else {
      setIsManual(true);
      fetchPredictions(text);
    }
  };

  const onFocusAddress = () => {
    if ((!address || address.trim() === '') && permissionGranted && region && region.latitude) {
      fetchAddress(region.latitude, region.longitude);
    }
  };

  // -------------- if user selects supported gov from modal ----------------
  const selectSupportedGov = async (gov) => {
    try {
      // gov.label expected (like "القاهرة")
      setErrorModalVisible(false);
      setShowLoader(true);
      const addr = `${gov.label}, مصر`;
      const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${GOOGLE_MAPS_KEY}&language=ar`);
      const data = await resp.json();
      if (data.status === 'OK' && data.results && data.results.length) {
        const { lat, lng } = data.results[0].geometry.location;
        const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(newRegion);
        const formatted = data.results[0].formatted_address || `${gov.label}, مصر`;
        setLocationAddress(formatted);
        setAddress(formatted);
        setIsManual(true);
        // set selected gov and clear area (user should refine)
        setSelectedGov(gov.label);
        setSelectedArea(null);
        setServerErrorMessage(null);
        setSupportedGovs([]);
      } else {
        Alert.alert(t('error') || 'خطأ', 'تعذر تعيين المحافظة المختارة. حاول اختيار عنوان محدد داخل المحافظة.');
      }
    } catch (err) {
      console.warn('selectSupportedGov error', err);
      Alert.alert(t('error') || 'خطأ', 'تعذر جلب بيانات المحافظة.');
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <HeaderApp title={t('location.details')} />
        <View style={styles.container}>
          {showLoader && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={btnColorDark} size={'large'} />
            </View>
          )}

          <MapView style={styles.map} region={region}>
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
              <View style={styles.marker}>
                <Image source={require('./../../../assets/images/icons/my-location.png')} style={{ width: 50, height: 50 }} />
              </View>
            </Marker>
          </MapView>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>{t('location.details')}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={onChangeAddress}
                placeholder={t('location.placeholder') || "Enter your address"}
                placeholderTextColor="#aaa"
                onFocus={onFocusAddress}
                blurOnSubmit={false}
              />
              <Text style={styles.icon}>📍</Text>
            </View>

            {predictionsLoading && <ActivityIndicator size="small" color={btnColor} />}

            {/* keyboardShouldPersistTaps ensures user can tap suggestion while keyboard is open */}
            {predictions.length > 0 && (
              <FlatList
                keyboardShouldPersistTaps="always"
                data={predictions}
                keyExtractor={(item) => item.place_id}
                style={{ maxHeight: 220 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => updateLocation(item.place_id)} activeOpacity={0.7}>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{item.description || item.structured_formatting?.main_text}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* show inline error box if serverErrorMessage exists */}
            {serverErrorMessage && (
              <View style={styles.inlineErrorBox}>
                <Text style={styles.inlineErrorText}>{serverErrorMessage}</Text>
                {supportedGovs.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ textAlign: 'center', fontFamily: 'Tajawal-Medium', color: '#333' }}>{t('location.supported_govs') || 'المحافظات المدعومة:'}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
                      {supportedGovs.map(g => (
                        <TouchableOpacity key={g.id} style={styles.govBadge} onPress={() => selectSupportedGov(g)}>
                          <Text style={styles.govBadgeText}>{g.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              disabled={showLoader || !!serverErrorMessage}
              style={[styles.continueButton, (showLoader || !!serverErrorMessage) ? { opacity: 0.5 } : {}]}
              onPress={handleUpdate}
            >
              <Text style={styles.continueButtonText}>{t('continue')}</Text>
            </TouchableOpacity>
          </View>

          {/* Modal عرض رسالة أكبر (جميلة) للحالة اللي فيها supported govs */}
          <Modal
            visible={errorModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setErrorModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{t('alert') || 'تنبيه'}</Text>
                <Text style={styles.modalMessage}>{serverErrorMessage}</Text>

                {supportedGovs.length > 0 && (
                  <>
                    <Text style={{ marginTop: 8, fontFamily: 'Tajawal-Medium', color: '#333', textAlign: 'center' }}>{t('location.supported_govs') || 'المحافظات المدعومة:'}</Text>
                    <View style={{ marginTop: 8 }}>
                      {supportedGovs.map(g => (
                        <TouchableOpacity key={g.id} style={styles.modalGovItem} onPress={() => selectSupportedGov(g)}>
                          <Text style={styles.modalGovText}>{g.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#eee' }]} onPress={() => setErrorModalVisible(false)}>
                    <Text style={{ color: '#333' }}>{t('close') || 'إغلاق'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: btnColor }]} onPress={() => {
                    setErrorModalVisible(false);
                  }}>
                    <Text style={{ color: '#fff' }}>{t('ok') || 'حسناً'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10, flex: 1, backgroundColor: '#fff', borderRadius: 20 },
  map: { flex: 1 },
  marker: { backgroundColor: 'rgba(50,50,50,0.05)', borderRadius: 50, padding: 8 },
  detailsContainer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, elevation: 5 },
  detailsTitle: { fontSize: 16, fontFamily: 'Tajawal-Bold', color: '#333', marginBottom: 10, marginTop: 10, alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4F4', borderRadius: 10, padding: 10, marginBottom: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  icon: { fontSize: 18, color: '#6A5ACD', marginLeft: 10 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  suggestionText: { fontSize: 16, color: '#333' },

  continueButton: { backgroundColor: btnColor, marginBottom: 15, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontSize: 15, fontFamily: 'Tajawal-Bold' },

  loaderOverlay: { position: 'absolute', width: width / 1.1, height: width / 1.1, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 9999999, alignSelf: 'center', top: '25%', alignItems: 'center', justifyContent: 'center' },

  inlineErrorBox: { backgroundColor: '#FDECEA', borderRadius: 8, padding: 10, marginVertical: 8 },
  inlineErrorText: { color: '#D9534F', textAlign: 'center', fontFamily: 'Tajawal-Medium' },
  govBadge: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, margin: 4 },
  govBadgeText: { color: '#444', fontFamily: 'Tajawal-Medium' },

  // modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 18 },
  modalTitle: { fontSize: 18, fontFamily: 'Tajawal-Bold', textAlign: 'center', marginBottom: 8 },
  modalMessage: { color: '#D9534F', textAlign: 'center', fontFamily: 'Tajawal-Medium' },
  modalGovItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f6f6f6', marginVertical: 6 },
  modalGovText: { textAlign: 'center', color: '#333' },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center' }
});
