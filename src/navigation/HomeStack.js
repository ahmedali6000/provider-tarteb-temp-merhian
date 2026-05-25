import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Core Screens
import HomeScreen from "../screens/Home";
import CategoryScreen from "../screens/Category";
import SubCategoryScreen from "../screens/Category/SubCategoryScreen";
// import ServiceScreen from './../screens/Service/ServiceScreen';

// Info Screens
import AboutScreen from '../screens/DATA/About';
import PrivacyScreen from '../screens/DATA/Privacy';
import TermsScreen from '../screens/DATA/Terms';
import Faq from '../screens/Faq';
import PricingGuide from '../screens/PricingGuide/PricingGuide';

// Order Process
import AcceptConditionsScreen from "../screens/Accept";
import RequestView from "../screens/Request";
import PreOrderRevsion from "../screens/Orders/PreOrderRevsion";
import OrderQRScreen from "../screens/OrderQRScreen/OrderQRScreen";

// Payment Flows
import ChooseChargingAmountPaymob from "../screens/Payment/Paymob/ChooseChargingAmountPaymob";
import ConfirmInfoPaymobScreen from "../screens/Payment/Paymob/ConfirmInfoPaymobScreen";
import CodePaymobScreen from "../screens/Payment/Paymob/CodePaymobScreen";
import ChooseChargingAmountFawry from "../screens/Payment/Fawry/ChooseChargingAmountFawry";
import ConfirmInfoFawryScreen from "../screens/Payment/Fawry/ConfirmInfoFawryScreen";
import FinishFawry from "../screens/Payment/Fawry/FinishFawry";

// V2 Screens
import SearchScreen from "../screens/Home/SearchScreen";
import TraditionalView from "../screens/v2/categories/Traditional/TraditionalView";
import TraditionalServicesScreen from "../screens/v2/categories/Traditional/TraditionalServicesScreen";
import NotificationsScreen from "../screens/Account/v2/notifications/NotificationsScreen";
import CleaningCategoriesView from "../screens/v2/categories/CleaningCategoriesView";
import CleaningScreen from "../screens/v2/categories/Traditional/CleaningScreen";
import OrderReviewScreen from "../screens/v2/categories/orderReview/OrderReviewScreen";
import SelectOrderAddressScreen from "../screens/v2/categories/orderReview/SelectOrderAddressScreen";

// Address Screens used inside order flow
import AddressDetailsScreen from "../screens/Account/v2/address/AddressDetailsScreen";
import PickAddressMapScreen from "../screens/Account/v2/address/PickAddressMapScreen";
import OrderScheduleTypeScreen from "../screens/v2/categories/orderReview/OrderScheduleTypeScreen";
import OrderScheduleScreen from "../screens/v2/categories/orderReview/OrderScheduleScreen";
import OrderDetailsScreen from "../screens/v2/categories/orderReview/OrderDetailsScreen";
import OrderSafetyInstructionsScreen from "../screens/v2/categories/orderReview/OrderSafetyInstructionsScreen";
import CreateOrderProgressScreen from "../screens/v2/categories/orderReview/CreateOrderProgressScreen";
import OrderSummaryScreen from "../screens/v2/categories/orderReview/OrderSummaryScreen";
import OrderFullDetailsScreen from "../screens/v2/categories/orderReview/OrderFullDetailsScreen";
import OrdersScreen from "../screens/Orders/V2/OrdersScreen";
import OrderQrCodeScreen from "../screens/v2/categories/orderReview/OrderQrCodeScreen";
import PaymentMethodsScreen from "../screens/v2/payment/PaymentMethodsScreen";
import OrderPaymentChannelsScreen from "../screens/v2/payment/OrderPaymentChannelsScreen";
import OrderCardPaymentWebViewScreen from "../screens/v2/payment/methods/OrderCardPaymentWebViewScreen";
import OrderPaymentCodeScreen from "../screens/v2/payment/methods/OrderPaymentCodeScreen";
import OrderPhoneWalletScreen from "../screens/v2/payment/methods/OrderPhoneWalletScreen";
import OrderChatScreen from "../screens/v2/categories/orderReview/OrderChatScreen";

const Stack = createNativeStackNavigator();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Core Home Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationsScreen} />

      {/* Service & Category Browsing */}
      <Stack.Screen name="TraditionalView" component={TraditionalView} />
      <Stack.Screen name="CleaningCategoriesView" component={CleaningCategoriesView} />
      <Stack.Screen name="CleaningScreen" component={CleaningScreen} />
       <Stack.Screen name="SubCategoryScreen" component={SubCategoryScreen} />
      <Stack.Screen name="TraditionalServicesScreen" component={TraditionalServicesScreen} />
      
      {/* <Stack.Screen name="ServiceScreen" component={ServiceScreen} />  */}

      {/* Order Review Flow */}
      <Stack.Screen name="OrderReviewScreen" component={OrderReviewScreen} />
      <Stack.Screen name="SelectOrderAddressScreen" component={SelectOrderAddressScreen} />
      <Stack.Screen name="OrderScheduleTypeScreen" component={OrderScheduleTypeScreen} />
      <Stack.Screen name="OrderScheduleScreen" component={OrderScheduleScreen} />
      <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderSafetyInstructionsScreen" component={OrderSafetyInstructionsScreen} />
      <Stack.Screen name="CreateOrderProgressScreen" component={CreateOrderProgressScreen} />
      <Stack.Screen name="OrderSummaryScreen" component={OrderSummaryScreen} />
      <Stack.Screen name="OrderFullDetailsScreen" component={OrderFullDetailsScreen} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
      <Stack.Screen name="OrderQrCodeScreen" component={OrderQrCodeScreen} />
      <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
      <Stack.Screen name="OrderPaymentChannelsScreen" component={OrderPaymentChannelsScreen} />
      <Stack.Screen name="OrderCardPaymentWebViewScreen" component={OrderCardPaymentWebViewScreen} />
      <Stack.Screen name="OrderPaymentCodeScreen" component={OrderPaymentCodeScreen} />
      <Stack.Screen name="OrderPhoneWalletScreen" component={OrderPhoneWalletScreen} />
      <Stack.Screen name="OrderChatScreen" component={OrderChatScreen} />


      {/* Address Flow inside order */}
      <Stack.Screen name="PickAddressMapScreen" component={PickAddressMapScreen} />
      <Stack.Screen name="AddressDetailsScreen" component={AddressDetailsScreen} />

      {/* Order Process */}
      <Stack.Screen
        name="AcceptConditionsScreen"
        component={AcceptConditionsScreen}
        options={{unmountOnBlur: true}}
      />
      <Stack.Screen
        name="RequestView"
        component={RequestView}
        options={{unmountOnBlur: true}}
      />
      <Stack.Screen
        name="PreOrderRevsion"
        component={PreOrderRevsion}
        options={{unmountOnBlur: true}}
      />
      <Stack.Screen
        name="OrderQRScreen"
        component={OrderQRScreen}
        options={{unmountOnBlur: true}}
      />

      {/* Payment Flows */}
      <Stack.Screen name="ChooseChargingAmountPaymob" component={ChooseChargingAmountPaymob} />
      <Stack.Screen name="ConfirmInfoPaymobScreen" component={ConfirmInfoPaymobScreen} />
      <Stack.Screen name="CodePaymobScreen" component={CodePaymobScreen} />
      <Stack.Screen name="ChooseChargingAmountFawry" component={ChooseChargingAmountFawry} />
      <Stack.Screen name="ConfirmInfoFawryScreen" component={ConfirmInfoFawryScreen} />
      <Stack.Screen name="FinishFawry" component={FinishFawry} />
    </Stack.Navigator>
  );
}