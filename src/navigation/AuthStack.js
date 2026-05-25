import React from "react";
import LoginScreen from "../screens/auth/v2/Login";
import OTPScreen from "../screens/auth/v2/OTPScreen";
import ProviderWorkInfoScreen from "../screens/auth/v2/ProviderWorkInfoScreen";
import AccountNameScreen from "../screens/auth/v2/AccountNameScreen";
 
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnterPhone from "../screens/auth/EnterPhone";
// import EnterOTP from "../screens/auth/EnterOTP";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";
import OnBoarding from "../screens/OnBoarding";
import { useSelector } from "react-redux";
import SelectLanguage from "../screens/OnBoarding/SelectLanguage";
import RegisterScreen from "../screens/auth/registration_steps/MainInfo";
import TermsScreen from "../screens/DATA/Terms";
import MissingSocialInfoScreen from "../screens/auth/MissingSocialInfoScreen";
// import AddressesScreen from "../screens/Account/v2/address/AddressesScreen";
// import AddressDetailsScreen from "../screens/Account/v2/address/AddressDetailsScreen";
import CompleteMissingDataScreen from "../screens/auth/v2/CompleteMissingDataScreen";
import AboutDocScreen from "../screens/auth/v2/AboutDocScreen";
import ProviderProfilePhotoScreen from "../screens/auth/v2/ProviderProfilePhotoScreen";
import ProviderFrontIdDocScreen from "../screens/auth/v2/ProviderFrontIdDocScreen";
import ProviderRearIdDocScreen from "../screens/auth/v2/ProviderRearIdDocScreen";
import ProviderRegistrationThanksScreen from "../screens/auth/v2/ProviderRegistrationThanksScreen";
 // import Welcome from "../screens/auth/Welcome";


const Stack = createNativeStackNavigator();

export function AuthStack(props){
    const app_visited = useSelector(state => state.myApp.app_visited)
    return (
        <Stack.Navigator initialRouteName={(app_visited == 'visited_before') ? "LoginScreen" : "SelectLanguage"}>
            <Stack.Screen name="SelectLanguage" component={SelectLanguage} options={{headerShown:false}} />
            <Stack.Screen name="OnBoarding" component={OnBoarding} options={{headerShown:false}} />
            {/* <Stack.Screen name="Welcome" component={Welcome} options={{headerShown:false}} /> */}
             <Stack.Screen name="AboutDocScreen" component={AboutDocScreen}  options={{headerShown:false}}/>
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{headerShown:false}} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false}} />
            <Stack.Screen name="CompleteMissingDataScreen" component={CompleteMissingDataScreen} options={{headerShown:false}} />
            <Stack.Screen name="AccountNameScreen" component={AccountNameScreen} options={{headerShown:false}} />
            <Stack.Screen name="ProviderWorkInfoScreen" component={ProviderWorkInfoScreen} options={{headerShown:false}}  />
            <Stack.Screen name="ProviderProfilePhotoScreen" component={ProviderProfilePhotoScreen} options={{headerShown:false}}  />
            <Stack.Screen name="ProviderFrontIdDocScreen" component={ProviderFrontIdDocScreen} options={{headerShown:false}}  />
            <Stack.Screen name="ProviderRearIdDocScreen" component={ProviderRearIdDocScreen} options={{headerShown:false}}  />
            <Stack.Screen name="ProviderRegistrationThanksScreen" component={ProviderRegistrationThanksScreen} options={{headerShown:false}}  />


        </Stack.Navigator>
    );
}