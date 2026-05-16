import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;
 
const styles = ScaledSheet.create({
    title:{
        fontSize:16,
        color:textColor,fontFamily:'Tajawal-Bold',
        alignSelf:'flex-start',
        backgroundColor:'#ddd',
        paddingVertical:10,
        paddingHorizontal:10,
        borderRadius:10,
        marginVertical:6
         
    },
    text:{
        fontSize:15.5,
        lineHeight:26,
        color:textColor,fontFamily:'Tajawal-Medium',
        alignSelf:'flex-start',
        textAlign:'left'

    }
 
});

export default styles;