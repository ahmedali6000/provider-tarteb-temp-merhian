import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../../shared/AppText';

const HomeHeader = ({
 userName = 'مستخدم ترتيب',
  location = 'اختر من العناوين الخاصة بك ..',
  userImage = null,
  onPressNotification,
  onPressLocation,
}) => {
  const isRTL = true || I18nManager.isRTL;

  return (
    <View style={styles.container}>
      <View style={[styles.row, {flexDirection: isRTL ? 'row' : 'row'}]}>
        <TouchableOpacity style={styles.iconButton} onPress={onPressNotification}>
          <Ionicons name="notifications-outline" size={20} color="#222" />
        </TouchableOpacity>

        <View style={styles.centerContent}>
          <AppText weight="bold" style={styles.userName}>
            {userName}
          </AppText>

          <TouchableOpacity
            onPress={onPressLocation}
            style={styles.locationWrapper}>
            <Ionicons name="chevron-down" size={14} color="#8B8B8B" />
            <AppText style={styles.locationText}>{location}</AppText>
            <Ionicons name="location-outline" size={14} color="#8B8B8B" />
          </TouchableOpacity>
        </View>

        <Image
          source={
            userImage
              ? {uri: userImage}
              : require('../../../assets/images/avatar.png')
          }
          style={styles.avatar}
        />
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  userName: {
    fontSize: 18,
    color: '#222',
  },
  locationWrapper: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});