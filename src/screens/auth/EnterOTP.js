import React from "react"
import {
  View, Text, SafeAreaView, ScrollView, Image,
  ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native'
import { moreHady, btnColor, backgroundColorHady, domain, textColor } from "../../utils/app";
import styles from "./style";
import { Paragraph, Title } from 'react-native-paper'
import AppInput from "../../components/auth/Input";
import AppButton from "../../components/auth/Button";
import Gtyles from "../../styles/Gstyle";
import axios from 'axios';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import PlatformTouchable from "../../components/PlatformTouchable";
import { myError } from "../../utils/HelperFunctions";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { register } from "../../redux/actions";
import AuthHeader from "../../shared/AuthHeader";

const EnterOTP = ({ route, navigation }) => {
  const [isLoading, changeisLoading] = React.useState(false);
  const CELL_COUNT = 4;
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [value, setValue] = React.useState('');
  const [donebtn, changeDone] = React.useState({ status: true, isloading: false });
  const [error, changeError] = React.useState({ status: false, text: '', color: 'red' });
  const [attemps, changeAttemps] = React.useState(0);
  const { name, phone, password, email, trigger_type, imageURL, type, appletoken, countrycode, invcode } = route.params;

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

  const [CansentOrNot, changeCansentOrNot] = React.useState(true);
  const [sentAgainLoader, changeSentAgainLoader] = React.useState(true);

  // ⏱️ Timer states
  const [resendTimer, setResendTimer] = React.useState(120);
  const [timerActive, setTimerActive] = React.useState(true);

  const GenerateCode = () => {
    changeSentAgainLoader(true);
    setResendTimer(120);
    setTimerActive(true);
    changeError({ status: false, text: '', color: 'red' })
    setValue('')
    var config = { method: 'get', url: domain + `/api/generate-code?phone=${phone}` };
    axios(config).then(res => {
      if (res.data == 'skkipp') {
        setTimeout(() => changeSentAgainLoader(false), 1500);

        if (trigger_type == 'register') {
          dispatch(register(trigger_type, name, phone, email, password, null, null, null, countrycode, invcode));
        } else if (trigger_type == 'phoneValidation') {
          navigation.navigate('NewPasswordScreen', { phone });
        } else if (trigger_type == 'phoneChange') {
          navigation.navigate('EnterNewPhone', { phone });
        }

      } else if (res.data == 'alot_of_attemps_try_again_after_2_hours') {
        changeCansentOrNot(false);
      } else {
        changeAttemps(attemps + 1);
        changeCansentOrNot(true);
      }
      changeSentAgainLoader(false);
    }).catch(() => changeSentAgainLoader(false));
  }

  const CheckCode = () => {
    changeDone({ status: false, isloading: true });
    if (value > 999 && value < 10000) {
      var config = {
        method: 'post',
        url: domain + `/api/check-code?phone=${phone}&value=${value}`
      };
      axios(config).then(res => {
        changeError({ text: t('auth.OTP.success'), color: 'green', status: true });
        if (trigger_type == 'register') {
          dispatch(register(trigger_type, name, phone, email, password, null, null, null, countrycode, invcode));
        } else if (trigger_type == 'phoneValidation') {
          navigation.navigate('NewPasswordScreen', { phone });
        } else if (trigger_type == 'phoneChange') {
          navigation.navigate('EnterNewPhone', { phone });
        } else if (trigger_type == 'sociallogin') {
          dispatch(register(trigger_type, name, phone, email, null, imageURL, type, appletoken, countrycode, invcode));
        }
        changeAttemps(attemps + 1);
      }).catch(err => {
        changeDone({ status: true, isloading: false });
        changeError({ text: t('auth.OTP.error'), color: 'red', status: true });
      });
    } else {
      changeDone({ status: false, isloading: false });
    }
  }

  React.useEffect(() => {
    GenerateCode();
  }, []);

  // ⏱️ countdown logic
  React.useEffect(() => {
    let interval = null;
    if (timerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer, timerActive]);

  return (
    <SafeAreaView style={styles.Wrapper}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: 'white' }}>
          <AuthHeader text={t('auth.OTP.title')} bar={0} />
          <View style={{ alignItems: "center" }}>
            <Image style={styles.otp} source={require('../../../assets/images/otp.jpg')} />
          </View>

          <View style={{ flex: 7, justifyContent: 'space-around', alignItems: "center" }}>
            <View style={{ alignItems: "center", width: '70%' }}>
              <Title style={{ fontSize: 20, fontFamily: 'Tajawal-Regular', color: 'black' }}>
                {t('auth.OTP.title')}
              </Title>
              <Paragraph style={{ fontSize: 16, textAlign: 'center', lineHeight: 28, marginTop: 10, fontFamily: 'Tajawal-Regular', color: 'black' }}>
                {t('auth.OTP.des')}
              </Paragraph>
            </View>

            {(attemps > 4 || !CansentOrNot) ?
              <View style={{ width: '90%' }}>
                {(attemps > 4) && myError(t('auth.OTP.error2'))}
                {(!CansentOrNot) && myError(t('otp.wait2h'))}
              </View>
              :
              <View>
                <SafeAreaView style={[styles.root, { direction: 'ltr' }]}>
                  <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={[styles.codeFieldRoot, (i18n.language == 'ar' && Platform.OS != 'ios') && { flexDirection: 'row-reverse' }]}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }) => (
                      <View
                        onLayout={getCellOnLayoutHandler(index)}
                        key={index}
                        style={[styles.cellRoot, isFocused && styles.focusCell]}>
                        <Text style={styles.cellText}>
                          {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                      </View>
                    )}
                  />
                  {error.status &&
                    <View style={{ marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16, color: error.color, fontFamily: 'Tajawal-Bold' ,borderBottomColor: error.color, borderBottomWidth:1}}>
                        {error.text}
                      </Text>
                    </View>
                  }

                  {/* إعادة الإرسال */}
                  <View style={{ marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {timerActive ? (
                      <Text style={{ fontSize: 14, fontFamily: 'Tajawal-Medium', color: 'gray' }}>
                        {t('auth.OTP.timer_message')}<Text style={{fontSize:20,fontFamily: 'Tajawal-Bold',color:'green'}}> {resendTimer}</Text> {t('auth.OTP.second')}
                      </Text>
                    ) : (
                      <>
                        <Text style={{ fontSize: 17, fontFamily: 'Tajawal-Medium', color: textColor }}>
                          {t('auth.OTP.footer1')}
                        </Text>
                        <PlatformTouchable onPress={GenerateCode}>
                          <Text style={{ marginHorizontal: 9, color: btnColor, fontSize: 17, fontFamily: 'Tajawal-Medium' }}>
                            {t('auth.OTP.footer2')}
                          </Text>
                        </PlatformTouchable>
                      </>
                    )}
                  </View>

                  <AppButton
                    disabled={(value > 999 && value < 10000 && donebtn.status) ? false : true}
                    isLoading={isLoading}
                    primary={true}
                    title={t('auth.OTP.btn')}
                    style={[Gtyles.button, Gtyles.primaryButton, { marginVertical: 15 }]}
                    onPressP={CheckCode}
                  />
                </SafeAreaView>
              </View>
            }
          </View>
        </ScrollView>

        {sentAgainLoader &&
          <View style={styles.waitTillDispatching}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 100,
              paddingHorizontal: 60
            }}>
              <ActivityIndicator size="large" />
              <Text style={[styles.waitTillDispatchingTxt, { marginTop: 25 }]}>
                {t('otp.sendingagai')}
              </Text>
            </View>
          </View>
        }
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default EnterOTP;
