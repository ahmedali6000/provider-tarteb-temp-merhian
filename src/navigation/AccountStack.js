import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Account Screens
// import AccountMainScreen from "../screens/Account/AccountMainScreen";
import ProfileScreen from "../screens/Account/v2/ProfileScreen";
import AccountScreen from "../screens/Account";
import EditAccountDataScreen from '../screens/Account/EditAccountDataScreen';
import ChangeLanguage from '../screens/Account/ChangeLanguage';
import ChangePassScreen from '../screens/Account/Password/ChangePassScreen';
import ChangePhone from '../screens/Account/change_phone/ChangePhone';
import EnterNewPhone from '../screens/Account/change_phone/EnterNewPhone';

// Location Screens
import LocationSelectScreen from '../screens/CHOOSE_LOCATION/LocationSelectScreen';
import UserLocationScreen from '../screens/Account/UserLocationScreen';
import AddLocation from '../screens/Account/AddLocation';

// Wallet Screens
import Wallet from '../screens/wallet';
import Incomes from '../screens/wallet/Incomes';
import Outcomes from '../screens/wallet/Outcomes';
import PayWithCard from '../screens/wallet/PayWithCard';
import PayWithAltPayment from '../screens/wallet/PayWithAltPayment';

// Fawaterak Screens
import PayRedirectScreen from '../screens/Fawaterak/PayRedirectScreen';
import ResponseScreen from '../screens/Fawaterak/Responses/ResponseScreen';
import PhoneWalletScreen from '../screens/Fawaterak/PhoneWalletScreen';
import CodeHandleScreen from '../screens/Fawaterak/CodeHandleScreen';

// Support Screens
import SupportPage from "../screens/support";
import SupportSendScreen from "../screens/support/SupportPage";
import EditProfileScreen from "../screens/Account/v2/EditProfileScreen";
import WalletScreen from "../screens/Account/v2/wallet/WalletScreen";
import TransactionsScreen from "../screens/Account/v2/wallet/TransactionsScreen";
import TransferBalanceScreen from "../screens/Account/v2/wallet/TransferBalanceScreen";
import PaymentMethods from "../screens/Account/v2/wallet/Fawaterak/PaymentMethods";
import HelpCenter from "../screens/Account/v2/help_and_support/HelpCenter";
import AbourCenter from "../screens/Account/v2/about_app/AbourCenter";
import FaqScreen from "../screens/Account/v2/help_and_support/FaqScreen";
import AboutDocScreen from "../screens/Account/v2/about_app/AboutDocScreen";
import ContactSupportScreen from "../screens/Account/v2/help_and_support/ContactSupportScreen";
import LoyaltyScreen from "../screens/Account/v2/LoyaltyScreen";
import AddressDetailsScreen from "../screens/Account/v2/address/AddressDetailsScreen";
import AddressesScreen from "../screens/Account/v2/address/AddressesScreen";
import PickAddressMapScreen from "../screens/Account/v2/address/PickAddressMapScreen";
import SupportMessagesScreen from "../screens/Account/v2/help_and_support/SupportMessagesScreen";
import OrderPaymentChannelsScreen from "../screens/v2/payment/OrderPaymentChannelsScreen";
import OrderCardPaymentWebViewScreen from "../screens/v2/payment/methods/OrderCardPaymentWebViewScreen";
import OrderPaymentCodeScreen from "../screens/v2/payment/methods/OrderPaymentCodeScreen";
import OrderPhoneWalletScreen from "../screens/v2/payment/methods/OrderPhoneWalletScreen";



const Stack = createNativeStackNavigator();

/**
 * Account Stack Navigator
 * Handles all user-related settings, profile, wallet, and support
 */
export function AccountStack() {
    return (
        <Stack.Navigator 
            initialRouteName="ProfileScreen"
            screenOptions={{ headerShown: false }}
        >
            {/* Main Profile */}
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="WalletScreen" component={WalletScreen} />
            <Stack.Screen name="TransactionsScreen" component={TransactionsScreen} />
            <Stack.Screen name="TransferBalanceScreen" component={TransferBalanceScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} />
            <Stack.Screen name="AbourCenter" component={AbourCenter} />
            <Stack.Screen name="FaqScreen" component={FaqScreen} />
            <Stack.Screen name="AboutDocScreen" component={AboutDocScreen} />
            <Stack.Screen name="SupportMessagesScreen" component={SupportMessagesScreen} /> 
            <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen} />
            <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
            <Stack.Screen name="AddressesScreen" component={AddressesScreen} />
            <Stack.Screen name="AddressDetailsScreen" component={AddressDetailsScreen} />
            <Stack.Screen name="PickAddressMapScreen" component={PickAddressMapScreen} /> 
            <Stack.Screen name="OrderPaymentChannelsScreen" component={OrderPaymentChannelsScreen} />
            <Stack.Screen name="OrderCardPaymentWebViewScreen" component={OrderCardPaymentWebViewScreen} />
            <Stack.Screen name="OrderPaymentCodeScreen" component={OrderPaymentCodeScreen} />
            <Stack.Screen name="OrderPhoneWalletScreen" component={OrderPhoneWalletScreen} />

            <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="EditAccountDataScreen" component={EditAccountDataScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
            <Stack.Screen name="ChangePassScreen" component={ChangePassScreen} />
            <Stack.Screen name="ChangePhone" component={ChangePhone} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="EnterNewPhone" component={EnterNewPhone} options={{ unmountOnBlur: true }} />

            {/* Locations */}
            <Stack.Screen name="LocationSelectScreen" component={LocationSelectScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="UserLocationScreen" component={UserLocationScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="AddLocation" component={AddLocation} options={{ unmountOnBlur: true }} />

            {/* Wallet & Payments */}
            {/* <Stack.Screen name="Wallet" component={Wallet} options={{ unmountOnBlur: true }} /> */}
            <Stack.Screen name="Incomes" component={Incomes} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="Outcomes" component={Outcomes} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="PayWithCard" component={PayWithCard} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="PayWithAltPayment" component={PayWithAltPayment} options={{ unmountOnBlur: true }} />

            {/* Fawaterak Integration */}
            {/* <Stack.Screen name="PaymentMethods" component={PaymentMethods} options={{ unmountOnBlur: true }} /> */}
            <Stack.Screen name="PayRedirectScreen" component={PayRedirectScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="CodeHandleScreen" component={CodeHandleScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="ResponseScreen" component={ResponseScreen} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="PhoneWalletScreen" component={PhoneWalletScreen} options={{ unmountOnBlur: true }} />

            {/* Support */}
            <Stack.Screen name="SupportPage" component={SupportPage} options={{ unmountOnBlur: true }} />
            <Stack.Screen name="SupportSendScreen" component={SupportSendScreen} options={{ unmountOnBlur: true }} />
        </Stack.Navigator>
    );
}
