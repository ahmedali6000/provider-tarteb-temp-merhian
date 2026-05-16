import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, moreHady, textColor } from '../../utils/app';
import i18next from 'i18next';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    res_tab:{
        paddingHorizontal:10,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor: 'white',
        paddingVertical:10,
        borderRadius:2,
        marginVertical:0
    },
    input:{
        textAlign:(i18next.language == 'ar') ? 'right' : 'left',
        flex:1,
        fontSize:14,
        color:textColor,
        fontFamily:'Tajawal-Regular',
     },
     card: {
         height:60,
         justifyContent:'center',
         width:'100%',
         paddingHorizontal:30,
         paddingVertical:7,
         marginVertical: 6,
         borderRadius: 6,
         borderColor:'transparent',
         backgroundColor:'white',
         flexDirection:'column',
     },
     
     span:{
        fontFamily:'Tajawal-Regular',
         marginBottom:3,
         fontSize:14
         // backgroundColor:'green'
     }
});

export default styles;