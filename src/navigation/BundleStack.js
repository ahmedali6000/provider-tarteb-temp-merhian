import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Bundle Screens
import BundleScreen from "../screens/Bundle/BundleScreen";
import MyBundleDetailsScreen from "../screens/Orders/Bundle/MyBundleDetailsScreen";
import BundlesScreen from "../screens/v2/bundles/BundlesScreen";
import DaySelectionScreen from "../screens/v2/bundles/DaySelectionScreen";
import OrderPaymentChannelsScreen from "../screens/v2/payment/OrderPaymentChannelsScreen";
import MySubscribedBundlesScreen from "../screens/v2/bundles/MySubscribedBundlesScreen";

const Stack = createNativeStackNavigator();

/**
 * Bundle Stack Navigator
 * Handles all screens related to subscription bundles and their details
 */
export function BundleStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BundlesScreen" component={BundlesScreen} />
            <Stack.Screen name="DaySelectionScreen" component={DaySelectionScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="OrderPaymentChannelsScreen" component={OrderPaymentChannelsScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="MySubscribedBundlesScreen" component={MySubscribedBundlesScreen} options={{ unmountOnBlur: true }} />
            {/* <Stack.Screen name="MyBundles" component={MyBundlesScreen} options={{ unmountOnBlur: true }} /> */}
            <Stack.Screen name="MyBundleDetails" component={MyBundleDetailsScreen} options={{ unmountOnBlur: true }} />
        </Stack.Navigator>
    );
}
