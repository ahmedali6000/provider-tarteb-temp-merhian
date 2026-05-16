import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { textColor } from '../../utils/app';
import i18next from 'i18next';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({

  
    input:{
       flex:1,
       fontSize:13.2,
       color:textColor,
       fontFamily:'Tajawal-Bold',
        textAlign: (i18next.language == 'ar') ? 'right' : 'right',
        // backgroundColor:'yellow'
    },
    card: {
        // minHeight:60,
        // width:'100%',
        justifyContent:'center',
        paddingHorizontal:20,
        paddingVertical:2,
        
        marginBottom: 15,
        borderRadius: 6,
        marginHorizontal:5,
        // backgroundColor:'#e8e8e8',
        backgroundColor:'#ededed',
        borderColor:'#e8e8e8',
        borderWidth:2,
        flexDirection:'column',
    },
    
    span:{
        fontFamily:'Tajawal-Regular',
        marginBottom:3,
        fontSize:14,
        color:textColor
        // backgroundColor:'green'
    }
 
     
});

export default styles;