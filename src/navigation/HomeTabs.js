import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from 'react-i18next';

// Stacks
import {HomeStack} from './HomeStack';
import {OrderStack} from './OrderStack';
import {AccountStack} from './AccountStack';
 import { MessageStack } from "./MessageStack";

// Custom Tab
import CustomTabBar from "../component/Tabs/CustomTabBar";


const Tab = createBottomTabNavigator();

export function HomeTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStack}  
        options={{ tabBarLabel: t('homeTabs.home') }}
      />
      <Tab.Screen 
        name="OrderStack" 
        component={OrderStack}
        options={{ tabBarLabel: t('homeTabs.orders') }}
      />
      <Tab.Screen 
        name="MessageStack" 
        component={MessageStack}
        options={{ tabBarLabel: t('homeTabs.chat') }}
      />
      <Tab.Screen 
        name="AccountStack" 
        component={AccountStack}
        options={{ tabBarLabel: t('homeTabs.myaccount') }}
      />
    </Tab.Navigator>
  );
}