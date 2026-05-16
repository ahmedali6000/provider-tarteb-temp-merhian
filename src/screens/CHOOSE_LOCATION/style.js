import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
     image:{
         width:50,
         height:50,
     },
     label:{
      color:textColor,fontFamily:'Tajawal-Bold',
      marginTop:5,
      fontSize:15,
      marginTop:9
         
     },
     text_under_label:{
        fontSize:14,
        color:textColor,fontFamily:'Tajawal-Bold',
        marginStart:10
     },
     text_container:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:8
     },
     error:{
      color:'red',
      color:textColor,fontFamily:'Tajawal-Regular',
      marginBottom:6,
      fontSize:13
  },
  checkIcon:{
   color:'green',
   fontSize:40,
   position:'absolute',
   zIndex:999,
   backgroundColor:'white',
   end:5,
   
},
});

export default styles;