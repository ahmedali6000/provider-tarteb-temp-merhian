import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { fontFamily, textColor } from '../../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({

  
    input:{
       flex:1,
       fontSize:14,
       color:textColor,
       fontFamily:'Tajawal-Regular',
    //    lineHeight:25
    },
    cardErr:{
        borderColor:'red',
        borderWidth:1,
    },
    inputbody: {
        
        width:'100%',
        paddingHorizontal:30,
        paddingVertical:12,
        marginVertical: 6,
        borderRadius: 8,
     
        backgroundColor:'#f2f0f0',
        flexDirection:'column',
    },
    flag:{
        width:28,
        height:20,
         
    },
   
    span:{
         
        marginBottom:1,
        fontSize:12.5,
         color:textColor,
        fontFamily:'Tajawal-Bold'
        
    }
 
     
});

export default styles;