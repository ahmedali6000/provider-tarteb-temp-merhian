  import { useIsFocused, useNavigation } from '@react-navigation/native';
  import React, { useState } from 'react';
  import { useTranslation } from 'react-i18next';
  import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput,
    SafeAreaView, ImageBackground, KeyboardAvoidingView, Platform, Keyboard
  } from 'react-native';
 import { Ionicons } from '@react-native-vector-icons/ionicons';
  import { useDispatch, useSelector } from 'react-redux';
  import { arabic_num, cutLongText } from '../../utils/HelperFunctions';
  import { backgroundColorHady, btnColor, domain, textColor } from '../../utils/app';
  import axios from 'axios';
  import HeaderApp from '../../shared/Header';
  import Gtyles from '../../styles/Gstyle';
  import { ActivityIndicator, List, Modal, Portal, Provider, Checkbox } from 'react-native-paper';
  import AppButton from '../../components/auth/Button';
  import { FLUSH_ORDER_DATA } from '../../redux/actions/ActionTypes';
  import i18next from 'i18next';

  const RequestView = () => {
    const { t, i18n } = useTranslation();
    const myorder = useSelector(state => state.order);
    const dispatch = useDispatch();
    const focus = useIsFocused();
    const navigation = useNavigation();
    const myaddress = useSelector(state => state.auth.my_selected_address);
    const [searching_provider, change_searching_provider] = React.useState(false);
    const [total_price, changeTotalPrice] = React.useState(0);
    const [Realtotal_price, changeRealtotal_price] = React.useState(0);
    const [requestState, setRequestState] = React.useState(false);
    const cadoo = useSelector(state => state.order.cadoo);
    const fatherHere = useSelector(state => state.order.fatherHere);
    const user = useSelector(state => state.auth.user);
    const tokenK = useSelector(state => state.auth.token);
    const [isLoading, changeIsLoading] = React.useState(false);


    // ➕ أضف بعد const [isLoading ...]
const [visibleConflictModal, setVisibleConflictModal] = React.useState(false);
const [conflictMsg, setConflictMsg] = React.useState('');
const [conflictOrderId, setConflictOrderId] = React.useState(null);
const [modalScale] = React.useState(new Animated.Value(0.8));

// helper آمن لاستخراج order id من أي شكل تعيده الـ API
const extractOrderId = (data) => {
  if (data == null) return null;
  if (typeof data === 'number' || typeof data === 'string') return data;
  if (typeof data === 'object') {
    if (data.id) return data.id;
    if (data.order_id) return data.order_id;
    if (data._id) return data._id;
    for (let k in data) {
      const v = data[k];
      if (typeof v === 'number' || typeof v === 'string') return v;
      if (v && typeof v === 'object' && (v.id || v.order_id || v._id)) return v.id || v.order_id || v._id;
    }
  }
  return null;
};

 

    // preorder modal states
    const [visiblePreorderModal, setVisiblePreorderModal] = React.useState(false);
    const [agreePreorder, setAgreePreorder] = React.useState(true);

    const CadooTrigger = (cadoo_arg) => {
      if (cadoo == cadoo_arg) {
        dispatch({
          type: UPDATE_CADOO,
          payload: 0
        });
        return;
      } else {
        dispatch({
          type: UPDATE_CADOO,
          payload: cadoo_arg
        });
      }
    };
    const [visibleDiscountModal, setDiscountVisibleModal] = React.useState(false);
    const [DisSen, setDisSen] = React.useState('');
    const [Dis, setDis] = React.useState(null);

    const [disabledConfirmation, setDisabledConfirmation] = useState(false);

  const store_order = () => {
    // alert('yes');
    // return;
        setDisabledConfirmation(false)
        setRequestState(false)
        changeIsLoading(false)
        const app_data = {
          "address_id" : myaddress.id,
            "discount_id" :   Dis?.id,
            "coupon":UsedCode,
            "coupon_id":promoCodeID,
            "price": total_price,
            "withOutDisPrice":Realtotal_price,
            "cadoo": cadoo,
            "father": fatherHere,
            "type": myorder.type,
            "sch_data": (myorder.type == 'sch') ? myorder.sch_data : null ,
            "preview": myorder.preview,
            "preview_cost": myorder.preview_cost,
            "category_id": myorder.order_category_id,
            "services_arr": (myorder.preview == true) ? [] : myorder.order_services // array
        };
        
        var config = {method: 'post',url: domain + '/api/post_order',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},
        data:app_data
      };

      
        axios(config).then(res => {
        console.warn(app_data);
          // change_searching_provider(true);
          dispatch({type:FLUSH_ORDER_DATA,payload:null});
          setTimeout(() => {
            change_searching_provider(false);
            navigation.navigate('ViewOrder',{
              order_id:res.data
            })
          }, 3000);
        })
            // alert('Sorry','Something went wrong')
        .catch(err => {
        console.warn(err);
          // سجل الشكل الحقيقي للرد حتى تقدر ترى ماذا أرسله السيرفر
          console.warn('store_order error ->', err?.response ?? err);

          const status = err?.response?.status;
          const data = err?.response?.data;

          if (status === 409) {
            // handle 409: message قد تكون '' لذلك نعطي fallback
            const rawMsg = (data && typeof data.message === 'string') ? data.message.trim() : '';
            const fallback = 'يوجد طلب سابق بنفس الفئة قيد التنفيذ';
            const msg = rawMsg !== '' ? rawMsg : (data?.msg || fallback);

            // order_id قد يكون رقم أو كائن -> استخرج بأمان
            const orderId = extractOrderId(data?.order_id ?? data);

            setConflictMsg(msg);
            setConflictOrderId(orderId);
            setVisibleConflictModal(true);
          } else {
            // حافظ على السلوك القديم لباقي الأخطاء
            AlertMessage('حصل خطأ أثناء إرسال الطلب، حاول مرة أخرى');
          }
        }).finally(res => {
          setRequestState(false)
            
        });
      }

      const GET_Discounts = () => {
          var config = {method: 'post',url: domain + '/api/dicount-finder',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{category_id:myorder.order_category_id,price: Realtotal_price}};
          axios(config).then(res => {
              if(res.data.status == 'yes'){
                setDiscountVisibleModal(true);
                setDis(res.data.data);
                setDisSen(res.data.sent);
                // changeRealtotal_price(total_price)
                
                if(res.data.data.type == 'per'){
                  changeTotalPrice(res.data.new_price)

                }else{
                  changeTotalPrice(total_price - res.data.data.discount)
                }
              
                
              }
          }).catch(err=>{
              
          }).finally(()=> { 
              
          });
      }
    

    React.useEffect(() => {
      if (focus == true) {
        setRequestState(false);
        setTimeout(() => {
          GET_Discounts();
        }, 500);
      }

      let total = myorder.order_services.reduce((n, { price, count }) => n + (price * count), 0) + myorder.preview_cost;
      if (total < user?.mincharge) {
        changeTotalPrice(user?.mincharge);
        changeRealtotal_price(user?.mincharge);
      } else {
        changeTotalPrice(total);
        changeRealtotal_price(total);
      }

      changeIsLoading(false);

    }, [focus]);

    const [promoCode, changePromoCode] = React.useState({ value: '' });
    const [promoCodeID, changePromoCodeID] = React.useState(null);
    const [promoCodeError, changepromoCodeError] = React.useState('');
    const [UsedCode, changeUsedCode] = React.useState(null);
    const [UsedCodeStatus, changeUsedCodeStatus] = React.useState(null);

    const updatePromoCode = promoVal => {
      changePromoCode({
        value: promoVal,
      });
    };

    const checkPromoCode = () => {
      
        // changePromoCode({...promoCode,incomeError:''})
        if(promoCode.value == ''){
          changepromoCodeError(t('request.coupon.errors.empty')) 
        }else{
          if(UsedCode == promoCode.value){
          
            changepromoCodeError(t('request.coupon.errors.repeated')) 
          }
          else{
              var config = {method: 'post',url: domain + '/api/check-coupon',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{code:promoCode.value,category_id:myorder.order_category_id,price: Realtotal_price}};
              axios(config).then(res => {
                  if(res.data.status == 'yes'){
                    setDiscountVisibleModal(true);
                    setDis(res.data.data);
                    setDisSen(res.data.sent);
                    changeUsedCodeStatus(true) //to write in green color.
                    changePromoCodeID(res.data.data.id)
                    changeUsedCode(res.data.data.code)
                    if(res.data.data.type == 'per'){
                      changeTotalPrice(res.data.new_price)

                    }else{
                      changeTotalPrice(total_price - res.data.data.discount)
                    }
                    changepromoCodeError(res.data.sent)
                    
                  }else  if(res.data.status == 'no'){
                    changepromoCodeError(res.data.sent)
                  }
              }).catch(err=>{
                  
              }).finally(()=> { 
                  
              });
          }
            
        }
      }

    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [couponCode, setCouponCode] = useState('');
    const toggleExpand = () => {
      if (isExpanded) {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => setIsExpanded(false));
      } else {
        setIsExpanded(true);
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    };
    const [contentHeight, setContentHeight] = useState((myorder.order_services.length > 0) ? 85 * myorder.order_services.length : 100);
    const animatedHeight = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, contentHeight],
    });

    const [fatherState, changeFatherState] = React.useState(true);

    const setFather = () => {
      if (fatherState == true) {
        changeFatherState(false);
      } else {
        changeFatherState(true);
      }
    };

    // small helper to show alert message (you can replace with Snackbar / custom)
    const AlertMessage = (msg) => {
      // simple fallback alert
      // you can replace with a better UI (snackbar / toast)
      console.warn(msg);
      // optionally use Alert.alert(msg)
    };

    return (
      <SafeAreaView style={{ flex: 1, }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Provider>
            {
              (requestState == false) ?
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                  <HeaderApp navigation={navigation} homeFlag={false} title={t('request.title')} />

                  {/* Details Section */}
                  <View style={styles.card}>
                    <View style={styles.row}>
                      <Text style={styles.label}>{t('request.date')}</Text>
                      <Text style={styles.value}>{(myorder.type == 'sch') ? [myorder.sch_data.date + ' ( ' + myorder.sch_data.hourStr + ' )'] : [new Date().toLocaleString(),]}</Text>
                    </View>
                    <View style={styles.row}>

                      <Text style={styles.label}>{t('order.screen.price')}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {(Realtotal_price != total_price) &&
                          <Text style={[styles.value, { marginHorizontal: 0, textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginEnd: 10 }]}>{arabic_num((Realtotal_price))} {t('cur')}</Text>
                        }
                        <Text style={[styles.value, { marginHorizontal: 0, }]}>{arabic_num((total_price))} {t('cur')}</Text>
                      </View>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>{t('request.cate')}</Text>
                      <Text style={styles.value}>{myorder.order_category_name}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>{t('request.address')}</Text>
                      <Text style={styles.value}>{cutLongText(myaddress.address, 35)}</Text>
                    </View>
                  </View>

                  {
                    (myorder.order_category_id == null) &&
                    <View style={[styles.card, { backgroundColor: '#e0fcd2' }]}>
                      <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 15, textAlign: 'center' }}>{t('request.reqSentSuccessfully')}</Text>
                    </View>
                  }

                  {/* Pricing Details */}
                  <View style={styles.card}>
                    <TouchableOpacity style={styles.row} onPress={toggleExpand}>
                      <Text style={[styles.label, { fontFamily: 'Tajawal-Bold', color: btnColor, fontSize: 14 }]}>{t('order.content.title_rev')}</Text>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#000" />
                    </TouchableOpacity>

                    <Animated.View
                      style={[styles.collapsible, { height: animatedHeight }]}
                      onLayout={(event) => {
                        const height = event.nativeEvent.layout.height;
                        if (contentHeight === 0) {
                          setContentHeight(height);
                        }
                      }}
                    >
                      <View style={styles.pricingRow}>
                        <Text style={styles.label}>{myorder.order_category_name}</Text>

                        <View style={{ flexDirection: 'row' }}>
                          {
                            (Realtotal_price != total_price) &&
                            <Text style={[styles.value, { marginHorizontal: 0, textDecorationLine: 'line-through', textDecorationStyle: 'solid', marginEnd: 10 }]}>{arabic_num((Realtotal_price) + cadoo)} {t('cur')}</Text>
                          }
                          <Text style={[styles.value, { marginHorizontal: 0, }]}>{arabic_num((total_price) + cadoo)} {t('cur')}</Text>
                        </View>
                      </View>

                      {(myorder.order_services.length > 0) &&
                        <View style={{ flex: 1, }}>
                          <View style={{ paddingTop: 10 }}>
                            {myorder.order_services.map((service, index) => {
                              return <View key={index} style={[styles.pricingRow, styles.totalRow]}>
                                <Text style={styles.label}>{cutLongText(service.service_name, 35)}</Text>
                                <Text style={styles.value}>{arabic_num(service.price) + ' x ' + arabic_num(service.count)}</Text>
                              </View>
                            })}
                          </View>
                        </View>
                      }{
                        (myorder.preview == true) ?
                          <View key={'preview'} style={[styles.pricingRow, styles.totalRow]}>
                            <Text style={[styles.value, { color: btnColor, alignSelf: 'center', width: '100%', textAlign: 'center' }]}>{t('order.screen.order_preview')}</Text>
                          </View>
                          :
                          <View style={{ flex: 1 }} ></View>
                      }
                    </Animated.View>
                  </View>

                  <View style={styles.card}>
                    <View style={styles.row}>
                      <Text style={styles.label}>{myorder.order_category_name}</Text>

                      <View style={{ flexDirection: 'row' }}>
                        {(Realtotal_price != total_price) ?
                          <Text style={[styles.value, { marginHorizontal: 0 }]}>{arabic_num((Realtotal_price))} {t('cur')}</Text>
                          :
                          <Text style={[styles.value, { marginHorizontal: 0 }]}>{arabic_num((total_price))} {t('cur')}</Text>
                        }
                      </View>
                    </View>

                    <View style={styles.pricingRow}>
                      <Text style={styles.label}>{t('request.dis.dis')}</Text>
                      <Text style={[styles.promoValue, ((Realtotal_price == total_price)) && { color: 'green' }]}>{(Realtotal_price != total_price) ? arabic_num((total_price - Realtotal_price)) + ' ' + t('cur') : t('request.dis.noDis')}</Text>
                    </View>

                    <View style={[styles.pricingRow, styles.totalRow]}>
                      <Text style={styles.label}>{t('order.content.total')}</Text>
                      <Text style={styles.value}>{arabic_num((total_price))} {t('cur')}</Text>
                    </View>
                  </View>

                  {/* Coupon Code Input */}
                  <View style={styles.card}>
                    <Text style={[styles.label, { fontFamily: 'Tajawal-Bold', color: btnColor, marginBottom: 10, textAlign: (i18next.language == 'ar') ? 'left' : 'right' }]}>{t('request.coupon.title')}</Text>
                    <View style={styles.couponRow}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder={t('request.coupon.placeholder')}
                        maxLength={11}
                        value={promoCode.value}
                        onChangeText={updatePromoCode}
                      />
                      <TouchableOpacity onPress={() => checkPromoCode()} style={styles.applyButton}>
                        <Text style={styles.applyButtonText}>{t('request.coupon.btn')}</Text>
                      </TouchableOpacity>
                    </View>
                    {(promoCodeError != '') &&
                      <Text style={[styles.error, (UsedCodeStatus == true) ? { color: 'green' } : { color: 'red' }]}>{promoCodeError}</Text>
                    }
                  </View>

                  <View style={styles.card}>
                    <View style={styles.paymentRow}>
                      <Ionicons name={(fatherState == true) ? "man" : "woman"} size={25} color={btnColor} />
                      <Text style={[styles.cardText, (fatherState == false) && { color: 'brown' }]}>{(fatherState == true) ? t('women.father') : t('women.only')}</Text>
                      <TouchableOpacity onPress={setFather}>
                        <Text style={styles.changeText}>{t('women.change')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Button — now opens Preorder Modal */}
                  {
                    (myorder.order_category_id != null) &&
                    <TouchableOpacity
                      disabled={disabledConfirmation || isLoading}
                      onPress={() => {
                        Keyboard.dismiss();
                        // setAgreePreorder(false);
                        setVisiblePreorderModal(true);
                      }}
                      style={[styles.confirmButton, (disabledConfirmation || isLoading) ? { opacity: 0.6 } : {}]}
                    >
                      {
                        (isLoading) ?
                          <ActivityIndicator size={'small'} color={'white'} />
                          :
                          <Text style={styles.confirmButtonText}>{t('request.continueorder')}</Text>
                      }
                    </TouchableOpacity>
                  }

                  <Portal>
                    <Modal visible={visibleDiscountModal} onDismiss={() => { setDiscountVisibleModal(false) }} contentContainerStyle={[{ backgroundColor: 'white', padding: 10, paddingBottom: 40, marginHorizontal: 10, borderRadius: 10, alignItems: 'center' }]}>
                      <View style={{ marginTop: -60, backgroundColor: 'white', borderRadius: 100, padding: 5 }}>
                        <ImageBackground source={require('./../../../assets/images/icons/offerx.png')} style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }} resizeMode="cover" >
                          <Text style={{ fontFamily: 'Tajawal-Bold', color: 'white', fontSize: 25, }}>{Dis?.discount}{(Dis?.type == 'per') ? '%' : t('cur')}</Text>
                        </ImageBackground>
                      </View>

                      <Text style={{ fontFamily: 'Tajawal-Bold', color: textColor, fontSize: 14.5, marginTop: 10 }}>{DisSen}</Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 20 }}>
                        <AppButton title={t('ok')} primary={true} style={[Gtyles.button, Gtyles.primaryButton, { marginVertical: 15, width: '85%', maxWidth: 300, alignSelf: 'center' }]} onPressP={() => setDiscountVisibleModal(false)} />
                      </View>
                    </Modal>

                    {/* Preorder instructions modal */}
                  
                        <Modal 
                          visible={visiblePreorderModal} 
                          onDismiss={() => setVisiblePreorderModal(false)} 
                          contentContainerStyle={styles.preorderModalWrapper}
                        >
                          <View style={styles.preorderHeader}>
                            <Ionicons name="shield-checkmark" size={40} color={btnColor} />
                            <Text style={styles.preorderTitle}>{t('request.preorder.title')}</Text>
                          </View>

                          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                            {[1, 2, 3, 4, 5].map((idx) => (
                              <View key={idx} style={styles.preorderRow}>
                                <Ionicons name="checkmark-circle" size={20} color={btnColor} style={{ marginEnd: 8 }} />
                                <Text style={styles.preorderText}>
                                  {t(`request.preorder.items.${idx}`)}
                                </Text>
                              </View>
                            ))}

                            <TouchableOpacity 
                              onPress={() => setAgreePreorder(prev => !prev)} 
                              style={styles.preorderAgreeRow} 
                              activeOpacity={0.8}
                            >
                              <Checkbox.Android
                                status={agreePreorder ? 'checked' : 'unchecked'}
                                // status={'checked'}
                                onPress={() => setAgreePreorder(prev => !prev)}
                                color={btnColor}
                              />
                              <Text style={styles.preorderAgreeText}>{t('request.preorder.agree')}</Text>
                            </TouchableOpacity>
                          </ScrollView>

                          {/* ثابت أسفل */}
                          <View style={styles.preorderFooter}>
                            <AppButton 
                              title={t('request.preorder.cancel')} 
                              primary={false} 
                              style={[Gtyles.button, Gtyles.secondaryButton, { flex: 1, minWidth:'40%',marginEnd: 10 }]} 
                              onPressP={() => setVisiblePreorderModal(false)} 
                            />
                           <AppButton 
                                title={t('request.preorder.confirm')} 
                                primary={true} 
                                disabled={!agreePreorder} 
                                style={[
                                  Gtyles.button, 
                                  { flex: 1,minWidth:'40%', backgroundColor: agreePreorder ? btnColor : '#ccc', opacity: agreePreorder ? 1 : 0.6 }
                                ]} 
                                onPressP={() => {
                                  if (!agreePreorder) return;            // ⬅️ حماية برمجية تمنع الضغط الفعلي
                                  setVisiblePreorderModal(false);
                                  setTimeout(() => { store_order(); }, 150);
                                }} 
                              />
                          </View>
                        </Modal>

                    {/* Conflict 409 modal */}
                   {/* Conflict (409) — Modern popup */}
                    <Modal
                      visible={visibleConflictModal}
                      onDismiss={() => setVisibleConflictModal(false)}
                      contentContainerStyle={styles.conflictModalWrapper}
                      dismissable={true}
                    >
                      <Animated.View style={{ transform: [{ scale: modalScale }], width: '100%' }}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ marginTop: -60, backgroundColor: btnColor, borderRadius: 100, padding: 14 }}>
                            <Ionicons name="warning" size={46} color={'white'} />
                          </View>

                          <Text style={styles.conflictTitle}>تنبيه</Text>

                          <Text style={styles.conflictMessage}>
                            {conflictMsg || 'يوجد طلب سابق بنفس الفئة قيد التنفيذ'}
                          </Text>

                          <View style={styles.conflictActions}>
                            
                            {/* <View style={{flex:1, height:50 }}> */}
                             <AppButton
                              title={'حسناً'}
                              primary={false}
                              style={[Gtyles.button, Gtyles.secondaryButton, { flex: 1, minWidth:'60%'}]}
                              onPressP={() => setVisibleConflictModal(false)}
                            />
                            {/* </View> */}
                            

                          
                          </View>
                        </View>
                      </Animated.View>
                    </Modal>


                  </Portal>

                </ScrollView>
                :
                <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator color={btnColor} size={'large'} />
                </View>
            }
          </Provider>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: '#F9F9F9',
    },
    error: {
      color: 'red',
      fontFamily: 'Tajawal-Bold',
      marginBottom: 6,
      alignSelf: 'center',
      marginTop: 10,
      fontSize: 12.2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Tajawal-Bold',
      marginLeft: 16,
    },
    card: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 1.9,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontSize: 13.3,
      color: '#555',
      fontFamily: 'Tajawal-Medium',
    },
    value: {
      fontSize: 13,
      fontFamily: 'Tajawal-Bold',
      color: '#000',
    },
    promoValue: {
      fontSize: 13,
      fontFamily: 'Tajawal-Bold',
      color: '#FF3B30',
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: 8,
    },
    collapsible: {
      overflow: 'hidden',
    },
    couponRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    couponInput: {
      textAlign: (i18next.language == 'ar') ? 'right' : 'left',
      flex: 1,
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: 8,
      padding: 10,
      marginRight: 8,
      fontSize: 14,
      fontFamily: 'Tajawal-Medium',
    },
    applyButton: {
      backgroundColor: btnColor,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    applyButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontFamily: 'Tajawal-Bold',
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardText: {
      fontSize: 14,
      fontFamily: 'Tajawal-Bold',
      color: '#000',
    },
    changeText: {
      fontSize: 14,
      fontFamily: 'Tajawal-Bold',
      color: btnColor,
    },
    confirmButton: {
      backgroundColor: btnColor,
      borderRadius: 25,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    confirmButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Tajawal-Bold',
    },

    // preorder modal styles
    preorderModalContainer: {
      backgroundColor: 'white',
      marginHorizontal: 16,
      padding: 18,
      borderRadius: 12,
      maxWidth: 720,
      alignSelf: 'center',
    },
    preorderTitle: {
      fontSize: 18,
      fontFamily: 'Tajawal-Bold',
      textAlign: 'center',
      marginBottom: 12
    },
    preorderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10
    },
    preorderBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: btnColor,
      marginTop: 6,
      marginEnd: 10
    },
    
  
  
    preorderModalWrapper: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    maxHeight: '80%',
    elevation: 4,
  },
  preorderHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  preorderTitle: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
    marginTop: 8,
    color: btnColor
  },
  preorderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  preorderText: {
    flex: 1,
    fontFamily: 'Tajawal-Medium',
    color: '#444',
    fontSize: 15,
    lineHeight: 22,
    textAlign:'left'
  },
  preorderAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  preorderAgreeText: {
    fontFamily: 'Tajawal-Medium',
    color: '#333',
    fontSize: 14,
   
  },
  preorderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
      height:50,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

    // conflict modal styles
    conflictModalWrapper: {
      backgroundColor: 'white',
      marginHorizontal: 16,
      padding: 18,
      borderRadius: 12,
      maxWidth: 720,
      alignSelf: 'center',
      alignItems: 'center',
      elevation: 6,
    },
    conflictTitle: {
      fontSize: 18,
      fontFamily: 'Tajawal-Bold',
      textAlign: 'center',
      marginTop: 8,
      color: btnColor,
    },
    conflictMessage: {
      fontSize: 15,
      fontFamily: 'Tajawal-Medium',
      color: '#333',
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 22,
    },
    conflictActions: {
      flexDirection: 'row',
      marginTop: 20,
      width: '100%',
      height:50,
      justifyContent: 'center',
    },

  });

  export default RequestView;
