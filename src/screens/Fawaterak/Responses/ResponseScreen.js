import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import RNRestart from 'react-native-restart';
import { succesColor } from '../../../utils/app';

export default function ResponseScreen ({ route, navigation },props) {
  const {status,item_name,item_price,item_id,paymentId,paymentName} = route.params;
  // const status = true
  const handleCancel = () => {
 
    // RNRestart.Restart()
    if (item_id < 1000) {
      navigation.navigate('MyBundlesScreen',{
      orType: 'complete'
    })
    } else {
      navigation.navigate('OrdersScreen',{
      orType: 'complete'
    })
    }
    
  };
  const {t,i18n} = useTranslation();

  React.useEffect(() => {
    if(status){
      // setTimeout(() => {
     
      //   RNRestart.Restart()
      // }, 1800);
    }
  
  })
  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={(status) ?  'checkmark-circle-outline' : 'close-circle-outline'} color={(status) ?  succesColor : '#d32f2f'} style={styles.icon} />
      </View>

      {/* Title */}
      <Text style={styles.title}> {(status) ?  t('payment.success') : t('payment.fail')}  </Text>

      {/* Description */}
      <Text style={styles.description}>
      {(status) ?  t('payment.success_des') : t('payment.fail_des')}
      </Text>

      {/* Cancel Button */}
      <TouchableOpacity style={[styles.cancelButton,{backgroundColor:(status) ?  succesColor : 'red'}]} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>{t('payment.finish')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 70,
   
  },
  title: {
    fontFamily:'Tajawal-Bold',
    fontSize: 22,
     
    marginBottom: 10,
  },
  description: {
    fontFamily:'Tajawal-Medium',
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    lineHeight: 26,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily:'Tajawal-Bold',
  },
});
