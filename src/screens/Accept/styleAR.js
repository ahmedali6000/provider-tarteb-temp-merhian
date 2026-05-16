import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;
 
const stylesa = ScaledSheet.create({
    title:{
        fontSize:16,
        color:textColor,fontFamily:'Tajawal-Medium',
        alignSelf:'flex-start'
         
    },
    text:{
        fontSize:15,
        lineHeight:25,
        color:textColor,fontFamily:'Tajawal-Medium',
        alignSelf:'flex-start',
        textAlign:'left'

    }
 
});

export default stylesa;