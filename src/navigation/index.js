import React, {useEffect, useRef} from "react";
import {
    BackHandler,
    ToastAndroid,
    Platform,
} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, Portal, Modal, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { AuthStack } from "./AuthStack";
import { HomeTabs } from "./HomeTabs";
import { CHANEG_NOTIFICATION_MESSAGE } from "../redux/actions/ActionTypes";
import AppButton from "../components/auth/Button";
import Gtyles from "../styles/Gstyle";
import { textColor } from "../utils/app";

import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

const SCREEN_NAMES = {
    HomeScreen: 'الرئيسية',
    TraditionalServicesScreen: 'الخدمات التقليدية',
    ServiceDetailsScreen: 'تفاصيل الخدمة',
    OrderCreateScreen: 'إنشاء طلب',
    PaymentScreen: 'الدفع',
    SupportScreen: 'الدعم',
    AccountScreen: 'حسابي',
    LoginScreen: 'تسجيل الدخول',
    RegisterScreen: 'إنشاء حساب',
};

export default function AppContainer(props) {
    const { isAuth } = props;
    const message = useSelector(state => state.myApp.NotificationMessage);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const navigationRef = useRef();
    const routeNameRef = useRef();
    const lastBackPressRef = useRef(0);

    useEffect(() => {
        const backAction = () => {
            const navigation = navigationRef.current;

            if (navigation?.canGoBack()) {
                navigation.goBack();
                return true;
            }

            const now = Date.now();

            if (now - lastBackPressRef.current < 2000) {
                BackHandler.exitApp();
                return true;
            }

            lastBackPressRef.current = now;

            if (Platform.OS === 'android') {
                ToastAndroid.show(
                    t('press_again_to_exit', {
                        defaultValue: 'اضغط مرة أخرى للخروج',
                    }),
                    ToastAndroid.SHORT,
                );
            }

            return true;
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => subscription.remove();
    }, [t]);

    const trackScreen = async (route) => {
        if (!route?.name) return;

        const routeName = route.name;
        const readableName = SCREEN_NAMES[routeName] || routeName;
        const analyticsInstance = getAnalytics();

        try {
            await logEvent(analyticsInstance, 'screen_view', {
                screen_name: readableName,
                screen_class: routeName,
            });
        } catch (error) {
            console.log('Analytics screen error:', error);
        }
    };

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={async () => {
                const route = navigationRef.current?.getCurrentRoute();
                routeNameRef.current = route?.name;
                await trackScreen(route);
            }}
            onStateChange={async () => {
                const previousRouteName = routeNameRef.current;
                const route = navigationRef.current?.getCurrentRoute();
                const currentRouteName = route?.name;

                if (previousRouteName !== currentRouteName) {
                    await trackScreen(route);
                }

                routeNameRef.current = currentRouteName;
            }}
        >
            <PaperProvider>
                <Portal>
                    {isAuth ? <HomeTabs /> : <AuthStack />}

                    {message != null && (
                        <Modal
                            visible={true}
                            dismissable={false}
                            contentContainerStyle={{
                                backgroundColor: 'white',
                                padding: 20,
                                margin: 15,
                                borderRadius: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'Tajawal-Bold',
                                    color: textColor,
                                    fontSize: 18,
                                    textAlign: 'center',
                                }}
                            >
                                {message.title}
                            </Text>

                            <Text
                                style={{
                                    fontFamily: 'Tajawal-Medium',
                                    color: textColor,
                                    fontSize: 14,
                                    textAlign: 'center',
                                    marginVertical: 15,
                                    lineHeight: 20,
                                }}
                            >
                                {message.body}
                            </Text>

                            <AppButton
                                title={t('ok')}
                                primary={true}
                                style={[
                                    Gtyles.button,
                                    Gtyles.primaryButton,
                                    {
                                        alignSelf: 'center',
                                        marginTop: 10,
                                        backgroundColor: 'green',
                                        minWidth: 100,
                                    },
                                ]}
                                onPressP={() =>
                                    dispatch({
                                        type: CHANEG_NOTIFICATION_MESSAGE,
                                        payload: null,
                                    })
                                }
                            />
                        </Modal>
                    )}
                </Portal>
            </PaperProvider>
        </NavigationContainer> 
    );
}