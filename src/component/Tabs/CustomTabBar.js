import React from "react";
import { View, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AppText from "../../shared/AppText";

import HomeIcon from '../../../assets/app/svgs/home.svg';
import HomeActiveIcon from '../../../assets/app/svgs/home_active.svg';

import OrderIcon from '../../../assets/app/svgs/order.svg';
import OrderActiveIcon from '../../../assets/app/svgs/order_active.svg';

import BundleIcon from '../../../assets/app/svgs/bundle.svg';
import BundleActiveIcon from '../../../assets/app/svgs/bundle_active.svg';

import UserIcon from '../../../assets/app/svgs/user.svg';
import UserActiveIcon from '../../../assets/app/svgs/user_active.svg';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const icons = {
    HomeStack: {
      active: HomeActiveIcon,
      inactive: HomeIcon,
    },
    OrderStack: {
      active: OrderActiveIcon,
      inactive: OrderIcon,
    },
    BundleStack: {
      active: BundleActiveIcon,
      inactive: BundleIcon,
    },
    AccountStack: {
      active: UserActiveIcon,
      inactive: UserIcon,
    },
  };

  return (
    <View
      style={[
        styles.container,
        { flexDirection: "row" } // أو row-reverse لو حبيت مع RTL
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const IconComponent = isFocused
          ? icons[route.name]?.active
          : icons[route.name]?.inactive;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          >
            {IconComponent ? <IconComponent width={23} height={23} /> : null}

            {/* لو حبيت تستخدم Ionicons */}
            {/*
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? "#1e88e5" : "#999"}
            />
            */}

            <AppText
              style={[
                styles.label,
                { color: isFocused ? "#1e88e5" : "#999" }
              ]}
            >
              {options.tabBarLabel}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 6,
    justifyContent: "space-around",
    alignItems: "center",
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label: {
    fontSize: 12,
    marginTop: 3,
    // fontFamily: "Tajawal-Medium",
  },
});