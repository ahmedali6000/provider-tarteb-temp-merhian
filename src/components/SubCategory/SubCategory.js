import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { btnColor, btnColorDark } from '../../utils/app';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AppBtnSimple from '../AppBtnSimple/AppBtnSimple';
export default function SubCategory(props){  
  const { subcategory, onShowDetails } = props;
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const redirect = () => {
    if(subcategory.childsCount == 0){
        navigation.navigate('CategoryScreen', {
            category: subcategory
          });
    }else{
      
        navigation.navigate('SubCategoryScreen', {
          category: subcategory
          });
    }
  }
  return (
    <View style={styles.card} >
       {/* <TouchableOpacity style={{position:'absolute',top:15,end:15}} onPress={() => onShowDetails(subcategory)}>
            <Text style={[styles.details, i18n.language == 'ar' ? { textAlign: 'left' } : {}]}>
              {t('order.screen.details')}
            </Text>
        </TouchableOpacity> */}
      <View style={styles.statusBox}>
            <Text style={styles.statusText}>{subcategory.discount}</Text>
      </View>
      <View style={[styles.content, i18n.language == 'ar' ? { flexDirection: 'row-reverse' } : {}]}>
       
        <View style={styles.textContainer}>
            
         <View style={{flexDirection:'row'}}>
         <Image source={{ uri: subcategory.image }} style={styles.icon} resizeMode="contain" />
         <Text style={[styles.title, i18n.language == 'ar' ? { textAlign: 'left' } : {}]}>
            {subcategory.name}
          </Text>
         </View>
          
          <Text style={[styles.description, i18n.language == 'ar' ? { textAlign: 'left' } : {}]}>
            {subcategory.des}
          </Text>
        

          <View style={styles.actions}>
              <AppBtnSimple title={t('view')} iconName="eye" onPress={redirect}/>
              <AppBtnSimple title={t('order.screen.details')} iconName="info-circle" onPress={() => onShowDetails(subcategory)} />
          </View>
        </View>
       
      </View>
    </View>
  );
};


//     return (
//       <View style={styles.card}>
//         {/* Header */}
//         <View style={styles.topRow}>
//           <Image source={{ uri: subcategory.image }} style={styles.logo} />
//           <View style={{ flex: 1, marginHorizontal: 10 }}>
//             <Text style={styles.title}>{subcategory.name}</Text>
//             <Text style={styles.invoice}>Invoice No: <Text style={styles.invoiceNumber}>{subcategory.name}</Text></Text>
//           </View>
//           <View style={styles.statusBox}>
//             <Text style={styles.statusText}>{subcategory.id}</Text>
//           </View>
//         </View>
  
//         {/* Details */}
//         <View style={styles.middleRow}>
//           <Text style={styles.price}>200</Text>
//           <Text style={styles.discount}>(13%)</Text>
//           <Text style={styles.date}> {subcategory.des}</Text>
//         </View>
  
//         {/* Actions */}
//         <View style={styles.actions}>
//           <TouchableOpacity style={styles.button}>
//             <Ionicons name="comment-alt" size={14} color="#007bff" />
//             <Text style={styles.buttonText}>Chat</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.button}>
//             <Ionicons name="phone-alt" size={14} color="#007bff" />
//             <Text style={styles.buttonText}>Call Us</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//   );
// };

 
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 25,
    // paddingBottom: 26,
    paddingHorizontal: 35,
    marginVertical: 8,
    marginHorizontal: 10,
    elevation: 4, // لأندرويد
    shadowColor: '#000', // للـ iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
    statusBox: {
    backgroundColor: '#e6d9fd',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    position:'absolute',
    end:15,
    top:15,
  },
  statusText: {
    fontSize: 12,
    color: '#8a2be2',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },

  title: {
    fontSize: 15,
    fontFamily:'Tajawal-Bold',
    textAlign: 'right',
    color: '#000',
    marginEnd:70,
    lineHeight:22
  },
  details:{
    fontSize: 12,
    fontFamily:'Tajawal-Bold',
    textAlign: 'right',
    color: btnColorDark,
   borderBottomColor:btnColorDark,
   borderBottomWidth:1,
   alignSelf:'flex-end'
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
    fontFamily:'Tajawal-Regular',
    lineHeight:20
  },
  icon: {
    width: 30,
    height: 30,
    marginEnd:10,
    // tintColor: '#0066cc', // حسب لون الأيقونة في التصميم
  },
});

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#f8f9ff',
//     borderRadius: 15,
//     padding: 15,
//     marginVertical: 10,
//     marginHorizontal: 20,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 45,
//     height: 45,
//     borderRadius: 10,
//   },
//   title: {
//     fontSize: 16,
//     fontFamily:'Tajawal-Bold',
//     textAlign: 'right',
//     color: '#000',
//   },
//   invoice: {
//     fontSize: 13,
//     color: '#555',
//   },
//   invoiceNumber: {
//     color: '#007bff',
//     fontWeight: 'bold',
//   },
//   statusBox: {
//     backgroundColor: '#e6d9fd',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#8a2be2',
//     fontWeight: 'bold',
//   },
//   middleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   price: {
//     fontSize: 18,
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   discount: {
//     fontSize: 12,
//     color: 'green',
//     marginLeft: 5,
//   },
//   date: {
//     fontSize: 12,
//     color: '#666',
//     marginLeft: 10,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 15,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderColor: '#007bff',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//   },
//   buttonText: {
//     color: '#007bff',
//     fontSize: 14,
//     marginLeft: 6,
//   },
// });
 
