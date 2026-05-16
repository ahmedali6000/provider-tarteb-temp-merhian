import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from 'react-i18next';

// Stacks
import {HomeStack} from './HomeStack';
import {OrderStack} from './OrderStack';
import {AccountStack} from './AccountStack';
import {BundleStack} from './BundleStack';

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
        options={{ tabBarLabel: t('drawer.home') }}
      />
      <Tab.Screen 
        name="OrderStack" 
        component={OrderStack}
        options={{ tabBarLabel: t('homeTabs.orders') }}
      />
      <Tab.Screen 
        name="BundleStack" 
        component={BundleStack}
        options={{ tabBarLabel: t('bundles.title') }}
      />
      <Tab.Screen 
        name="AccountStack" 
        component={AccountStack}
        options={{ tabBarLabel: t('myaccount.title') }}
      />
    </Tab.Navigator>
  );
}