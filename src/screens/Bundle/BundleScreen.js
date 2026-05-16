import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import HeaderApp from '../../shared/Header';
import PlatformTouchable from '../../components/PlatformTouchable';
import { useNavigation } from '@react-navigation/native';
import { btnColor, domain, LOADER_TIME_DELAY_PLUS } from '../../utils/app';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

 

export default function BundleScreen({ route, navigation }) {
   const {t,i18n} = useTranslation();
   const { category } = route.params;
    const tokenK = useSelector(state => state.auth.token);
    const [DATA,appendData] = React.useState(null);
   
    const GET_Bubdles_DATA = () => {
        var config = {method: 'get',url: `${domain}/api/get-bundles?category_id=${(category ? category.id : null)}`,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            appendData(res.data.data);
           
        }).catch(err=>{
          alert(err)
        }).finally(()=> {
             
        });
         
    }

      React.useEffect(()=>{
            GET_Bubdles_DATA();
        },[])
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <HeaderApp title={t('bundles.title') } />
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.header}>الباقات المتوفرة</Text> */}
      {
        (DATA != null) ? 
         <View style={styles.grid}>
            {DATA.map((item, index) => (
               
            <View style={styles.card} key={index}>
                <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                <Pressable android_ripple={{ color: '#fff', borderless: false }} onPress={() =>  navigation.navigate('DaySelectionScreen', {
                    bundle: item
                    })}> 
                    
                <View>
                    <Text style={[styles.name,(i18n.language == 'ar') && {textAlign:'left'}]}>{item.name}</Text>
                    <Text style={[styles.description,(i18n.language == 'ar') && {textAlign:'left'}]}>{item.des}</Text>
                    
                </View>
                <View style={styles.detailsContainer}>
                <Text style={[styles.detailItem,(i18n.language == 'ar') && {textAlign:'left'}]}>- {item.num_per_week} {t('bundles.week_times')}</Text>
                <Text style={[styles.detailItem,(i18n.language == 'ar') && {textAlign:'left'}]}>- {item.num_per_month} {t('bundles.month_times')}</Text>
                <Text style={[styles.detailItem,(i18n.language == 'ar') && {textAlign:'left'}]}>- {t('bundles.' + item.type)}</Text>
                </View>
                <View>
                    <Text style={[styles.discountText,(i18n.language == 'ar') && {textAlign:'left'}]}>وفر {item.discount}%</Text>
                    <View style={styles.progress}>
                    <View style={[styles.progressBar, { width: `${item.discount}%` }]} />
                    </View>

                    <View style={styles.priceContainer}>
                    <Text style={styles.price}>{item.price} جنيه</Text>
                    <Text style={styles.oldPrice}>{item.real_price} جنيه</Text>
                    </View>
                </View>
                </Pressable>
            </View>
               
            )) }
            
           
           
        </View>
         :
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator color={btnColor} size={'large'} /></View>
        
      }
       

    </ScrollView>
    </SafeAreaView>
  );
}


// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#ddd',
//     padding: 16,
//     flex:1
//   },
//   header: {
//     fontSize: 18,
//     fontFamily: 'Tajawal-Bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#2783c4',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     width: '48%',
//     backgroundColor: '#2783c4',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     minHeight: 210,
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   name: {
//     fontFamily: 'Tajawal-Bold',
//     fontSize: 18,
//     color: '#fff',
//     marginBottom: 6,
//   },
//   description: {
//     fontSize: 13,
//     fontFamily: 'Tajawal-Regular',
//     lineHeight:20,
//     color: '#e0f2ff',
//     marginBottom: 10,
//   },
//   discountText: {
//     fontSize: 13,
//     color: '#ffe600',
//     fontFamily: 'Tajawal-Regular',
//     marginBottom: 6,
//   },
//   progress: {
//     height: 8,
//     borderRadius: 10,
//     backgroundColor: '#ffffff50',
//     overflow: 'hidden',
//     marginBottom: 6,
//   },
//   progressBar: {
//     height: '100%',
//     borderRadius: 10,
//     backgroundColor: '#fff',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//   },
//   price: {
//     fontSize: 15,
//     color: '#fff',
//    fontFamily: 'Tajawal-Bold',
//   },
//   oldPrice: {
//     fontSize: 13,
//      fontFamily: 'Tajawal-Regular',
//     color: '#ffffff80',
//     textDecorationLine: 'line-through',
//   },
// });

// white version

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2', // لون الخلفية العامة
    padding: 16,
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2783c4',
  },
  grid: {
    flexDirection: 'row',
    
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '49%',
    backgroundColor: '#fff',
    
    borderRadius: 16,
    padding: 16,
     paddingVertical:20,
    marginBottom: 20,
    minHeight: 210,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontFamily: 'Tajawal-Bold',
    fontSize: 14.5,
    marginTop:13,
    color: '#2783c4',
    marginBottom: 9,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 20,
    color: '#444',
    marginBottom: 10,
  },
  discountText: {
    fontSize: 13,
    color: '#2783c4',
    fontFamily: 'Tajawal-Bold',
    marginBottom: 6,
  },
  progress: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#2783c4',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    color: '#2783c4',
    fontFamily: 'Tajawal-Bold',
  },
  oldPrice: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  detailsContainer: {
  marginBottom: 10,
},
detailItem: {
  fontSize: 12,
  fontFamily: 'Tajawal-Bold',
  color: '#666',
  marginBottom: 2,
},
badge: {
  position: 'absolute',
  top: 12,
  end: 12,
  backgroundColor: '#e6d9fd', // لون مميز - يمكن تغييره حسب نوع الباقة
  paddingVertical: 4,
  paddingHorizontal: 7,
  borderRadius: 12,
  zIndex: 1,
},
badgeText: {
  fontSize: 10,
  fontFamily: 'Tajawal-Bold',
   color: '#8a2be2',
},
});



