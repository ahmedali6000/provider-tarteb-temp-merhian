import React from 'react';
import {I18nManager, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TOKEN_KEY, OnBoarding_KEY, Language_KEY} from './src/utils/app';

import {setToken, setUser, logout} from './src/redux/actions';
import {getProviderProfile} from './src/services/providerProfileService';

import AppContainer from './src/navigation';
import {useSelector, useDispatch} from 'react-redux';
import 'react-native-gesture-handler';
import {
  APP_VISITED_CHANGE,
  CHANGE_APP_LANG,
  UPDATE_CREDIT,
  UPDATE_POINTS,
  UPGRADE,
  CHAHNGE_PAYMENT_FEATURE_STATUS,
  CHAHNGE_FIXING_MODE_STATUS,
  UPLOAD_IMAGE_REG,
} from './src/redux/actions/ActionTypes';
import messaging from '@react-native-firebase/messaging';
import {useTranslation} from 'react-i18next';
import {useNetInfo} from '@react-native-community/netinfo';
import Noenternet from './src/screens/EXscreens/Noenternet';
import Upgrade from './src/screens/EXscreens/Upgrade';
import Maintenance from './src/screens/EXscreens/Maintenance';
import BlockingScreen from './src/screens/EXscreens/BlockingScreen';
import RNRestart from 'react-native-restart';
import ChatBot from './src/components/Chatbot';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {requestNotifications} from 'react-native-permissions';
import {
  requestForegroundNotificationPermission,
  displayForegroundNotification,
} from './src/services/foregroundNotificationService';
import {emitChatMessageReceived} from './src/events/chatRealtimeEvents';

function App() {
  const {i18n} = useTranslation();
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  const token = useSelector(state => state.auth.token);
  const upgrade = useSelector(state => state.myApp.upgrade);
  const fixing_mode = useSelector(state => state.myApp.fixing_mode);
  const blocked = useSelector(state => state.auth.user?.blocked);

  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadProviderProfile = async () => {
      try {
        const res = await getProviderProfile();

        const data = res?.data || {};
        const user = data?.user;

        if (user) {
          dispatch(setUser(user));
        }

        dispatch({
          type: UPLOAD_IMAGE_REG,
          payload:
            data?.image_url ||
            user?.image ||
            user?.profile_photo_path ||
            null,
        });

        dispatch({
          type: UPDATE_CREDIT,
          payload: data?.credit ?? data?.wallet ?? user?.wallet ?? 0,
        });

        dispatch({
          type: UPDATE_POINTS,
          payload: data?.stats?.points ?? user?.points ?? 0,
        });

        if (res?.upgrade !== undefined) {
          dispatch({
            type: UPGRADE,
            payload: res.upgrade,
          });
        }

        if (user?.payment != 0) {
          dispatch({
            type: CHAHNGE_PAYMENT_FEATURE_STATUS,
            payload: user?.payment,
          });

          dispatch({
            type: CHAHNGE_FIXING_MODE_STATUS,
            payload: user?.fixing_mode,
          });
        }
      } catch (error) {
        console.log(
          'GET PROVIDER PROFILE ERROR:',
          error?.response?.data || error?.message,
        );

        if (error?.response?.status === 401) {
          dispatch(logout());
        }
      }
    };

    const initApp = async () => {
      try {
        const onboarding = await AsyncStorage.getItem(OnBoarding_KEY);
        dispatch({type: APP_VISITED_CHANGE, payload: onboarding});

        const lang = await AsyncStorage.getItem(Language_KEY);
        const selectedLang = lang || 'en';
        const isRTL = selectedLang === 'ar';

        await i18n.changeLanguage(selectedLang);
        dispatch({type: CHANGE_APP_LANG, payload: selectedLang});

        if (onboarding === 'visited_before' && I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
          RNRestart.Restart();
          return;
        }

        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        dispatch(setToken(savedToken || ''));

        if (savedToken) {
          await loadProviderProfile();
        }

        if (isMounted) {
          setReady(true);
        }
      } catch (error) {
        console.log('APP INIT ERROR:', error);

        if (isMounted) {
          setReady(true);
        }
      }
    };

    initApp();

    requestNotifications(['alert', 'sound', 'badge'])
      .then(({status}) => {
        console.log('Notification permission:', status);
      })
      .catch(error => {
        console.log('Notification permission error:', error);
      });

    requestForegroundNotificationPermission()
      .then(() => {
        console.log('Foreground notification permission ready');
      })
      .catch(error => {
        console.log('Foreground notification permission error:', error);
      });

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log(
        '🔥 FCM FOREGROUND MESSAGE:',
        JSON.stringify(remoteMessage),
      );

      const data = remoteMessage?.data || {};
      const rawType = data?.type;

      if (rawType === 'chat_message') {
        const incomingMessage = {
          id: data?.message_id,
          message_id: data?.message_id,
          conversation_id: data?.conversation_id,
          order_id: data?.order_id,
          sender_id: data?.sender_id,
          sender_role: data?.sender_role,
          message_type: data?.message_type || 'text',
          body: data?.body,
          time: data?.time,
          created_at: data?.created_at,
          is_mine: false,
        };

        console.log('📩 EMIT CHAT MESSAGE:', incomingMessage);

        emitChatMessageReceived(incomingMessage);

        try {
          await displayForegroundNotification(remoteMessage);
        } catch (error) {
          console.log('Display chat foreground notification error:', error);
        }

        return;
      }

      const type = Number(rawType);

      if (type === 3) {
        dispatch({
          type: UPDATE_CREDIT,
          payload: data?.credit,
        });
      } else if (type === 123) {
        dispatch({
          type: UPDATE_POINTS,
          payload: data?.points,
        });
      } else if (type === 999) {
        RNRestart.Restart();
        return;
      }

      try {
        await displayForegroundNotification(remoteMessage);
      } catch (error) {
        console.log('Display foreground notification error:', error);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeOnMessage();
    };
  }, [dispatch, i18n]);

  if (!ready) {
    return null;
  }

  let content = null;

  if (netInfo.isConnected === false) {
    content = <Noenternet />;
  } else if (upgrade > 0) {
    content = <Upgrade />;
  } else if (blocked == 1) {
    content = <BlockingScreen />;
  } else if (fixing_mode === true) {
    content = <Maintenance />;
  } else {
    content = (
      <>
        <AppContainer isAuth={!!token} />
        <ChatBot />
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;