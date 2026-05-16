import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
 


export async function requestUserPermission() {
  try {
    const permissionType = Platform.select({
      android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
      ios: PERMISSIONS.IOS.NOTIFICATIONS,
    });

    // ✅ فحص إذا الإشعار محظور من النظام
    const status = await check(permissionType);

    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'الإشعارات محظورة',
        'يرجى تفعيل الإشعارات من إعدادات الهاتف.',
        [
          { text: 'فتح الإعدادات', onPress: () => openSettings() },
          { text: 'إلغاء', style: 'cancel' },
        ]
      );
      return;
    }

    if (status === RESULTS.DENIED || status === RESULTS.UNAVAILABLE) {
      const reqStatus = await request(permissionType);
      if (reqStatus !== RESULTS.GRANTED) {
        console.log('🚫 لم يتم منح إذن الإشعارات');
        return;
      }
    }

    // ✅ طلب الإذن من Firebase أيضًا
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted.');
    } else {
      console.log('⚠️ Notification permission not granted from Firebase.');
    }
  } catch (error) {
    console.log('❌ Error requesting notification permission:', error);
  }
}




 
 
 