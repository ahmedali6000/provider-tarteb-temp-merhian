import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  AppState,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import messaging from '@react-native-firebase/messaging';
import {useTranslation} from 'react-i18next';
import {
  checkNotifications,
  requestNotifications,
  openSettings,
  RESULTS,
} from 'react-native-permissions';

import AppText from '../../../shared/AppText';
import AppButton from '../../../component/AppButton';
import LoadingModal from '../../../component/LoadingModal';

const ProviderRegistrationThanksScreen = () => {
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  useEffect(() => {
    checkNotificationPermission();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkNotificationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isPermissionEnabled = status => {
    return (
      status === RESULTS.GRANTED ||
      status === RESULTS.LIMITED ||
      status === 'granted'
    );
  };

  const isPermissionBlocked = status => {
    return status === RESULTS.BLOCKED || status === 'blocked';
  };

  const checkNotificationPermission = async () => {
    try {
      setCheckingPermission(true);

      const result = await checkNotifications();

      const enabled = isPermissionEnabled(result.status);
      const blocked = isPermissionBlocked(result.status);

      setNotificationsEnabled(enabled);
      setNotificationsBlocked(blocked);
    } catch (error) {
      console.log('CHECK NOTIFICATION PERMISSION ERROR:', error);
      setNotificationsEnabled(false);
      setNotificationsBlocked(false);
    } finally {
      setCheckingPermission(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      setLoading(true);

      const current = await checkNotifications();

      if (isPermissionEnabled(current.status)) {
        setNotificationsEnabled(true);
        setNotificationsBlocked(false);

        try {
          await messaging().getToken();
        } catch (tokenError) {
          console.log('FCM TOKEN ERROR:', tokenError);
        }

        return;
      }

      if (isPermissionBlocked(current.status)) {
        setNotificationsBlocked(true);
        await openSettings('notifications').catch(() => openSettings());
        return;
      }

      const requested = await requestNotifications([
        'alert',
        'sound',
        'badge',
      ]);

      if (isPermissionEnabled(requested.status)) {
        setNotificationsEnabled(true);
        setNotificationsBlocked(false);

        try {
          await messaging().getToken();
        } catch (tokenError) {
          console.log('FCM TOKEN ERROR:', tokenError);
        }

        return;
      }

      if (isPermissionBlocked(requested.status)) {
        setNotificationsBlocked(true);
        await openSettings('notifications').catch(() => openSettings());
        return;
      }

      setNotificationsEnabled(false);
      setNotificationsBlocked(false);
    } catch (error) {
      console.log('REQUEST NOTIFICATION PERMISSION ERROR:', error);

      try {
        await openSettings('notifications');
      } catch (settingsError) {
        openSettings();
      }
    } finally {
      setLoading(false);
      checkNotificationPermission();
    }
  };

  const getButtonTitle = () => {
    if (notificationsBlocked) {
      return tr(
        'provider_register.open_notification_settings',
        'فتح إعدادات الإشعارات',
      );
    }

    return tr(
      'provider_register.enable_notifications',
      'تفعيل الإشعارات',
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LoadingModal visible={loading || checkingPermission} />

      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']}
        locations={[0, 0.38]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <AppText weight="bold" style={styles.title}>
              {tr('provider_register.thanks_title', 'شكراً لتسجيلك معنا')}
            </AppText>

            <AppText style={styles.subtitle}>
              {tr(
                'provider_register.thanks_subtitle',
                'تقوم حالياً بمراجعة بياناتك للتأكد منها، ستتلقى إشعاراً عند تفعيل حسابك.',
              )}
            </AppText>
          </View>

          {!notificationsEnabled && !checkingPermission && (
            <AppButton
              title={getButtonTitle()}
              onPress={requestNotificationPermission}
              style={styles.button}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ProviderRegistrationThanksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 28 : 34,
  },

  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 34,
  },

  title: {
    fontSize: 26,
    color: '#171717',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 10,
  },

  subtitle: {
    width: '86%',
    fontSize: 13,
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 22,
  },

  button: {
    width: '100%',
    height: 52,
    borderRadius: 13,
    backgroundColor: '#3498db',
  },
});