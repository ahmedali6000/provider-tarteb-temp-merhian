import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  AppState,
} from 'react-native';
import {
  openSettings,
  requestNotifications,
  checkNotifications,
} from 'react-native-permissions';

const ENABLED_STATUSES = ['granted', 'limited', 'provisional', 'ephemeral'];

const NotificationWarning = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);
  const [lastSettings, setLastSettings] = useState(null);
  const appState = useRef(AppState.currentState);

  const checkPermission = async () => {
    try {
      const res = await checkNotifications();
      // res === { status: 'granted'|'denied'|..., settings: {...} }
      const { status, settings } = res || {};
      console.log('[Notifications] checkNotifications ->', res);

      setLastStatus(status);
      setLastSettings(settings);

      // Accept several positive statuses (iOS can return 'limited' or 'provisional')
      const enabledFromStatus = ENABLED_STATUSES.includes(status);

      // Fallback: if settings object exists and shows alert/notificationCenter enabled, treat as enabled
      const enabledFromSettings =
        settings &&
        (settings.alert === true ||
          settings.notificationCenter === true ||
          settings.authorizationStatus === 4); // numeric fallback (some platforms)

      const isEnabled = Boolean(enabledFromStatus || enabledFromSettings);
      setNotificationsEnabled(isEnabled);
      return res;
    } catch (err) {
      console.error('[Notifications] checkPermission error', err);
      setNotificationsEnabled(false);
      return null;
    }
  };

  useEffect(() => {
    // initial check
    checkPermission();

    // check again when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const current = await checkNotifications();
      console.log('[Notifications] before request ->', current);

      // If user has explicitly blocked or denied, prompt to open settings
      if (current?.status === 'blocked' || current?.status === 'denied') {
        Alert.alert(
          'الإشعارات معطلة',
          'يرجى تفعيل الإشعارات من إعدادات التطبيق.',
          [
            { text: 'الذهاب للإعدادات', onPress: handleOpenSettings },
            { text: 'إلغاء', style: 'cancel' },
          ]
        );
        return;
      }

      // otherwise request permission (this will show system popup for first-time)
      const request = await requestNotifications(['alert', 'sound', 'badge']);
      console.log('[Notifications] requestNotifications ->', request);

      // refresh state after request
      await checkPermission();

      if (ENABLED_STATUSES.includes(request?.status)) {
        Alert.alert('تم التفعيل', 'الإشعارات مفعّلة الآن ✅');
      } else {
        Alert.alert('لم يتم التفعيل', 'لم تُعطَ الإذن. إذا رفضت من قبل، فعّلها من الإعدادات.');
      }
    } catch (err) {
      console.error('[Notifications] handleEnableNotifications error', err);
      Alert.alert('خطأ', 'حصل خطأ أثناء محاولة طلب الإذن.');
    }
  };

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      openSettings();
    } else {
      Linking.openSettings();
    }
  };

  // لو متفعل خلاص مخفي
  if (notificationsEnabled) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        الإشعارات غير مفعّلة. لن تصلك التنبيهات المهمة!
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleEnableNotifications}>
          <Text style={styles.buttonText}>تفعيل الآن</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={handleOpenSettings}>
          <Text style={styles.linkText}>الذهاب للإعدادات</Text>
        </TouchableOpacity>
      </View>

      {/* DEBUG: شوف القيم اللي رجعت من checkNotifications */}
      {__DEV__ && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 12, color: '#333' }}>debug status: {String(lastStatus)}</Text>
          <Text style={{ fontSize: 12, color: '#333', marginTop: 4 }}>
            debug settings: {lastSettings ? JSON.stringify(lastSettings) : 'null'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationWarning;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c2c7',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  message: {
    color: '#842029',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Tajawal-Bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Tajawal-Regular',
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  linkText: {
    color: '#842029',
    fontFamily: 'Tajawal-Regular',
    textDecorationLine: 'underline',
  },
});
