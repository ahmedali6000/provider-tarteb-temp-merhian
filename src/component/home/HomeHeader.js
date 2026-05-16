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
import { useSelector } from 'react-redux';
import { cutLongText } from '../../utils/HelperFunctions';

const HomeHeader = ({
  userName = 'مستخدم ترتيب',
  location = 'اختر من العناوين الخاصة بك ..',
  userImage = null,
  onPressNotification,
  onPressLocation,
}) => {
  const isRTL = true || I18nManager.isRTL;
  const user = useSelector( state => state.auth.user );
  return (
    <View style={styles.container}>
      <View style={[styles.row, {flexDirection: isRTL ? 'row' : 'row'}]}>
        
       
       <View style={{flexDirection:'row'}}>
         <Image
          source={
            user?.image
              ? {uri:   user?.image}
              : require('../../../assets/app/data/avatar.png')
          }
          style={styles.avatar}
        />
            <View style={styles.centerContent}>
          <AppText weight="bold" style={styles.userName}>
            {user?.name}
          </AppText>

          <TouchableOpacity
            onPress={onPressLocation}
            style={styles.locationWrapper}>
             <Ionicons name="location" size={16} color="#2D93D2" />
            <AppText style={styles.locationText}>{cutLongText(location,35)}</AppText>
            <Ionicons name="chevron-down" size={14} color="#8B8B8B" />
           
          </TouchableOpacity>
        </View>
       </View>

       
        <TouchableOpacity style={styles.iconButton} onPress={onPressNotification}>
          <Ionicons name="notifications-outline" size={20} color="#222" />
        </TouchableOpacity>
       
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
    // flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  userName: {
    fontSize: 20,
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
    width: 55,
    height: 55,
    borderRadius: 21,
  },
});