import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Order Screens
import IntroOrdersScreen from "../screens/Orders/IntroOrdersScreen";
import OrdersScreen from "../screens/Orders/V2/OrdersScreen";
// import AllOrders from "../screens/Orders/AllOrders";
// import View_Order from "../screens/Orders/View_Order";
import ChatScreen from '../screens/Orders/ChatScreen';

// Bundle Related
import MyBundlesScreen from "../screens/Orders/Bundle/MyBundlesScreen";
import MyBundleDetailsScreen from "../screens/Orders/Bundle/MyBundleDetailsScreen";
import OrderSummaryScreen from "../screens/v2/categories/orderReview/OrderSummaryScreen";
import OrderFullDetailsScreen from "../screens/v2/categories/orderReview/OrderFullDetailsScreen";
import OrderQrCodeScreen from "../screens/v2/categories/orderReview/OrderQrCodeScreen";
import PaymentMethodsScreen from "../screens/v2/payment/PaymentMethodsScreen";
import OrderPaymentChannelsScreen from "../screens/v2/payment/OrderPaymentChannelsScreen";
import OrderCardPaymentWebViewScreen from "../screens/v2/payment/methods/OrderCardPaymentWebViewScreen";
import OrderPaymentCodeScreen from "../screens/v2/payment/methods/OrderPaymentCodeScreen";
import OrderPhoneWalletScreen from "../screens/v2/payment/methods/OrderPhoneWalletScreen";
import OrderChatScreen from "../screens/v2/categories/orderReview/OrderChatScreen";

const Stack = createNativeStackNavigator();

/**
 * Order Stack Navigator
 * Centralizes all order-related screens and chat functionality
 */
export function OrderStack() {
    return (
        <Stack.Navigator 
            initialRouteName="OrdersScreen"
            screenOptions={{ headerShown: false }}
        >
            {/* Orders List & Management */}
            {/* <Stack.Screen name="IntroOrdersScreen" component={IntroOrdersScreen} /> */}
            <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="OrderSummaryScreen" component={OrderSummaryScreen} />
            <Stack.Screen name="OrderFullDetailsScreen" component={OrderFullDetailsScreen} />
            <Stack.Screen name="OrderQrCodeScreen" component={OrderQrCodeScreen} />
            <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
            <Stack.Screen name="OrderPaymentChannelsScreen" component={OrderPaymentChannelsScreen} />
            <Stack.Screen name="OrderCardPaymentWebViewScreen" component={OrderCardPaymentWebViewScreen} />
            <Stack.Screen name="OrderPaymentCodeScreen" component={OrderPaymentCodeScreen} />
            <Stack.Screen name="OrderPhoneWalletScreen" component={OrderPhoneWalletScreen} />
            <Stack.Screen name="OrderChatScreen" component={OrderChatScreen} />
            {/* <Stack.Screen name="AllOrders" component={AllOrders} options={{ unmountOnBlur: true }} /> */}
             
            {/* Communication */}
            <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ unmountOnBlur: true }} />

            {/* Bundles */}
            <Stack.Screen name="MyBundlesScreen" component={MyBundlesScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="MyBundleDetailsScreen" component={MyBundleDetailsScreen} options={{ unmountOnBlur: true }} />
        </Stack.Navigator>
    );
}
