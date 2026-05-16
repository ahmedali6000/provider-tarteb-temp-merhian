import { View, Text } from 'react-native'
import React from 'react'
import {useSelector , useDispatch} from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import styles from './style';
import { btnColorDark, domain } from '../../utils/app';
import PlatformTouchable from '../../components/PlatformTouchable';
import { login, send_request } from '../../redux/actions';
import axios from 'axios';
import { UPDATE_TEMP_DATE } from '../../redux/actions/ActionTypes';


export default function TotalPriceComp(props) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const booked = useSelector(state => state.request.requested_data); 
    const tokenK = useSelector(state => state.auth.token); 
    // const [v,changeV] = React.useState(false);
    const [x,changeX] = React.useState(0);
    const total_price = useSelector(state => state.request.total_price); 



    const [isLoading,changeisLoading] = React.useState(false);
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    const SubmitHandler = () => {
      // dispatch({
      //   type:UPDATE_TEMP_DATE,
      //   payload:'2000-07-14'
      // });
      changeisLoading(true);
        var config = {method: 'post',url: domain + '/api/book-courts-hours',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{bookings:booked}};
              axios(config).then(res => {
              
                changeisLoading(false);
                
                navigation.navigate('SuccessScreen', {
                  result: res.data
                });
                }).catch(err=>{}).finally(()=>{
                  
                })

      
    }



    React.useEffect( () => {
      
      {booked.map(item => {
        changeX(x + item.price)
        // return x = ;
        })}
         
    },[booked]);


  


  return (
    (total_price > 0) &&
    <PlatformTouchable
    disabled={!donebtn.status} isLoading={donebtn.isloading}
    onPress={SubmitHandler}
    >
        <View style={{backgroundColor:'orange',position:'absolute',bottom:10,backgroundColor:btnColorDark,
        borderRadius:3,
        width:'95%',
        alignSelf:'center',
        paddingVertical:15,
        paddingHorizontal:20,
        flexDirection:'row',
        justifyContent:'space-between'
        }}>
          <Text style={{fontSize:18,color:'white',fontWeight:'bold'}}> Book</Text>
          <Text style={{fontSize:18,color:'white',fontWeight:'bold'}}> {total_price} EGP</Text>
        </View>
    </PlatformTouchable>
  )
}

