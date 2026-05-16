import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    topIMGsection:{
        backgroundColor:'#ddd',
        // flex:1,

    },
    img:{
        width:width,
        height:width-100,
    },
    secondSection:{
          justifyContent:'center',
          flex:1,
          alignItems:'center'  
    },
    cardData:{
        paddingVertical:20,
        paddingHorizontal:13,
        width:'95%',
        marginTop:-50,
    },
    title:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        marginBottom:10
    },
    des:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        lineHeight:25
    }

});

export default styles;