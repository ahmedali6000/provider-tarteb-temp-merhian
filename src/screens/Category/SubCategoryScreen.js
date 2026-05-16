import React from "react";
import {
  View, Text, ScrollView, SafeAreaView, Dimensions ,
  Image, FlatList,Pressable, Modal, StyleSheet, Button
} from 'react-native';
import HeaderApp from "../../shared/Header";
import { useTranslation } from "react-i18next";
import { btnColor, btnColorDark, domain, textColor } from "../../utils/app";
import axios from "axios";
import SubCategory from "../../components/SubCategory/SubCategory";
import { useSelector } from "react-redux";
// import YoutubePlayer from 'react-native-youtube-iframe';
import AppBtnSimple from "../../components/AppBtnSimple/AppBtnSimple";
import AppButton from "../../components/auth/Button";
import Gtyles from "../../styles/Gstyle";
 

export default function SubCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const { t, i18n } = useTranslation();

  const [loaderState, changeloaderState] = React.useState(true);
  const [DATA, appendData] = React.useState(null);

  const screenWidth = Dimensions.get('window').width;
const modalWidth = screenWidth - 40;

  // ✅ حالة المودال
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null);
  const tokenK = useSelector(state => state.auth.token);
  const handleOpenModal = (subcategory) => {
    const config = {
        method: 'get',
        url: `${domain}/api/categories-data?id=${subcategory.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + tokenK,
        }
      };
      axios(config).then(res => {
        setSelectedSubCategory(res.data);
        changeloaderState(true);
        setModalVisible(true);
      });
    // setSelectedSubCategory(subcategory);
    // setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSubCategory(null);
  };

  const GET_DATA = () => {
    const config = {
      method: 'get',
      url: `${domain}/api/view-sub-categories?parent_id=${category.id}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    axios(config).then(res => {
      appendData(res.data);
      changeloaderState(false);
    });
  };

  React.useEffect(() => {
    GET_DATA();
  }, [category]);

  const renderSubCategory = ({ item }) => (
    <SubCategory subcategory={item} onShowDetails={handleOpenModal} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <HeaderApp title={category.name} />

        <View style={{ marginVertical: 20, marginBottom: 100, paddingHorizontal: 8 }}>
          
          { (category.bundles > 0) &&
           <Pressable android_ripple={{ color: '#fff', borderless: false }} onPress={() =>  navigation.navigate('BundleScreen', {
              category: category
            })}>
               <View style={styles.card} >
                   
                  <View style={styles.statusBox}>
                        <Text style={styles.statusText}>{'3 باقات'}</Text>
                  </View>
                  <View style={[styles.content, i18n.language == 'ar' ? { flexDirection: 'row-reverse' } : {}]}>
                   
                    <View style={styles.textContainer}>
                        
                     <View style={{flexDirection:'row',backgroundColor:'transparent'}}>
                     <Image source={require('../../../assets/images/bundle2.png')} style={styles.icon} resizeMode="contain" />
                      <View style={{flex:1}}>
                        <Text style={[styles.title, i18n.language == 'ar' ? { textAlign: 'left' } : {}]}>
                          متوفر نظام الباقات
                        </Text>
                        <Text style={[styles.description, i18n.language == 'ar' ? { textAlign: 'left' } : {}]}>
                           يمكنك الحجز بشكل دوري .. سهولة اكتر وتوفير اكتر
                        </Text>
                      </View>
                     </View>
                     
                      
                    
            
                      {/* <View style={styles.actions}>
                          <AppBtnSimple title={t('view')} iconName="eye" onPress={()=>{}}/>
                          <AppBtnSimple title={t('order.screen.details')} iconName="info-circle" onPress={() => onShowDetails(subcategory)} />
                      </View> */}
                    </View>
                   
                  </View>
                </View>
           </Pressable>
           }

          <FlatList data={DATA} renderItem={renderSubCategory} />
        </View>

        {/* ✅ المودال المركزي */}
        <Modal visible={modalVisible} transparent onRequestClose={handleCloseModal}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modalContent}>
              {selectedSubCategory && (
                <>
                  <Text style={modalStyles.title}>{selectedSubCategory.name}</Text>
                  <Text style={modalStyles.description}>{selectedSubCategory.fulldes}</Text>
                  {selectedSubCategory.video_id && (
                    <View style={modalStyles.videoWrapper}>
                    {/* <YoutubePlayer
                        height={220}
                        width={ Dimensions.get('window').width - 80 }
                        play={false}
                         
                        videoId={selectedSubCategory.video_id}

                        
                    /> */}
                    </View>
                )}

                {/* <TouchableOpacity style={modalStyles.button} onPress={handleCloseModal}>
                <Text style={modalStyles.buttonText}>إغلاق</Text>
                </TouchableOpacity> */}
                {/* <AppBtnSimple title="xx" /> */}
                <AppButton  title={t('ad.btn2')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:Dimensions.get('window').width * 0.7,maxWidth:300,alignSelf:'center'}]} onPressP={handleCloseModal}/> 
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
    button: {
        backgroundColor: '#3498db', // لون الزر
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
      },
      buttonText: {
        color: '#fff', // لون النص
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'System', // تقدر تغيّره لأي خط مخصص
      },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width - 50,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  videoWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Tajawal-Regular',
    marginBottom: 20,
    color:'black'
  },



  
});
  // new for bundls
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 25,
    // paddingBottom: 26,
    paddingHorizontal: 25,
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
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    position:'absolute',
    end:15,
    top:15,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Tajawal-Bold',
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
    color: 'red',
    marginTop: 4,
    textAlign: 'right',
    fontFamily:'Tajawal-Regular',
    lineHeight:20
  },
  icon: {
    width: 65,
    height: 80,
    marginEnd:10,
    // backgroundColor:'red'
    // tintColor: '#0066cc', // حسب لون الأيقونة في التصميم
  },
});