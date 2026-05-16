import notifee, {AndroidImportance, EventType} from '@notifee/react-native';

export const createForegroundNotificationChannel = async () => {
  const channelId = await notifee.createChannel({
    id: 'foreground_default',
    name: 'Foreground Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  return channelId;
};

export const requestForegroundNotificationPermission = async () => {
  await notifee.requestPermission();
  await createForegroundNotificationChannel();
};

export const displayForegroundNotification = async remoteMessage => {
  const channelId = await createForegroundNotificationChannel();

  const title =
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    'ترتيب';

  const body =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    '';

  if (!title && !body) {
    return;
  }

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage?.data || {},
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
      importance: AndroidImportance.HIGH,
    },
    ios: {
      sound: 'default',
    },
  });
};

export const listenForegroundNotificationPress = navigationRef => {
  return notifee.onForegroundEvent(({type, detail}) => {
    if (type !== EventType.PRESS) {
      return;
    }

    const data = detail?.notification?.data || {};

    if (data?.screen && navigationRef?.isReady?.()) {
      navigationRef.navigate(data.screen, data);
    }
  });
};