import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
 
import RNRestart from 'react-native-restart';
import { btnColor, succesColor } from '../../utils/app';
import { ActivityIndicator } from 'react-native-paper';

export default function CodeHandleScreen ({ route, navigation },props) {
  const {status,item_name,item_price,item_id,paymentId,paymentName} = route.params;
  const handleCancel = () => {
    // يمكن إضافة التنقل أو أي منطق آخر هنا
    RNRestart.Restart()
  };
  const {t,i18n} = useTranslation();
  const [code,setCode] = React.useState(null);
  return (
    <View style={styles.container}>
      {/* Close Button */}
      {/* <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity> */}

      {/* Icon */}
      <View style={styles.iconContainer}>
          <Image source={{uri: 'https://app.fawaterk.com/clients/payment_options/fawrypng'}} style={{width:200,height:100,resizeMode:'contain'}} />
      </View>

      {/* Title */}
       
        {(code) ?  
          <Text style={styles.title}> {code}  </Text>
           : 
          <ActivityIndicator size={'large'} color={btnColor} />
          }
      
      

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
