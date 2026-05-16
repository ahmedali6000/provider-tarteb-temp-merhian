import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHadytop, btnColor, btnColorDark, textColor } from '../../utils/app';
import i18next from 'i18next';
const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    input:{
        fontFamily:'Tajawal-Regular' ,
         color: textColor ,
         fontSize:14,
         padding:10,
         alignItems:'center',
         justifyContent:'center'
    },
    previewTxt:{
        fontFamily:'Tajawal-Medium',
        fontSize:12,
        lineHeight:21,
        color:textColor,
        textAlign: (i18next.language == 'ar') ? 'left':'right'
    },

    

    
});

export default styles;