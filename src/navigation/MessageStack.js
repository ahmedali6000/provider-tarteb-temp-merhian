import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

 
 import MessagesScreen from "../screens/Account/v2/messages/MessagesScreen";
import ProviderConversationScreen from "../screens/Account/v2/messages/ProviderConversationScreen";
 

const Stack = createNativeStackNavigator();

/**
 * Message Stack Navigator
 * Handles all screens related to subscription Messages and their details
 */
export function MessageStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MessagesScreen" component={MessagesScreen}  options={{ unmountOnBlur: true }} /> 
            <Stack.Screen name="ProviderConversationScreen" component={ProviderConversationScreen}  options={{ unmountOnBlur: true }} /> 
        
        </Stack.Navigator>
    );
}
