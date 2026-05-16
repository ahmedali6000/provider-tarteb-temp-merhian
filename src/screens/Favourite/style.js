import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    mesBoxWrapper:{
        marginVertical:5,
         
    },

    header:{
        fontSize:17,
        fontFamily:'Tajawal-Regular',
        marginStart:1,
        marginBottom:5

    },

    image:{
        width:100,
        height:100
    },
    text:{
        fontSize:14,
        fontFamily:'Tajawal-Regular',
        marginTop:15
    }
 
});

export default styles;