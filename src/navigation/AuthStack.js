import React from "react";
import LoginScreen from "../screens/auth/v2/Login";
import OTPScreen from "../screens/auth/v2/OTPScreen";
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
            <Stack.Screen name="CompleteMissingDataScreen" component={CompleteMissingDataScreen} options={{headerShown:false}} />
            <Stack.Screen name="AccountNameScreen" component={AccountNameScreen} options={{headerShown:false}} />
            {/* <Stack.Screen name="AddressesScreen" component={AddressesScreen} /> */}
             
            {/* <Stack.Screen name="AddressDetailsScreen" component={AddressDetailsScreen} /> */}
            {/* <Stack.Screen name="PickAddressMapScreen" component={PickAddressMapScreen} /> */}


            <Stack.Screen name="MissingSocialInfoScreen" component={MissingSocialInfoScreen} options={{headerShown:false}} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} options={{headerShown:false}} />
            <Stack.Screen name="EnterPhone" component={EnterPhone} options={{headerShown:false}} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{headerShown:false}} />
            <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} options={{headerShown:false}} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} options={{headerShown:false}} />

        </Stack.Navigator>
    );
}