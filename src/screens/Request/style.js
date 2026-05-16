import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { btnColorDark, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    container: { padding: 16, paddingTop: 10, backgroundColor: '#fff' ,borderTopColor:'#ddd',borderTopWidth:2},
    head: {  height: 40,  backgroundColor: '#f1f8ff'  },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa',fontSize:12},
    row: {  height: 35  },
    text: { textAlign: 'center' ,   fontFamily:'Tajawal-Regular' , color: textColor,fontSize:12},
    familyState:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },
    familyStateImage:{
        width:40,
        height:40,
    },
    family_checkboxContainer:{
        borderColor:'black',
        borderWidth:1,
        borderRadius:50,
        alignSelf:'center'
    },
    familyText:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        fontSize:13,
        marginVertical:7,
    },
    discountText:{

    },
    
    discountImageWrapper:{

    },
    cadooWrapper:{
        flexDirection:'row',
        paddingVertical:20,
         
        alignItems:'center',
        justifyContent:'space-between'
    },
    cadooItem:{
        alignItems:'center',
        justifyContent:'center',
        borderWidth:1,
        borderColor:btnColorDark,
        paddingVertical:12,
        paddingHorizontal:18,
        borderRadius:60,
        width:100,
        height:100,
        alignItems:'center'
    },
    cadooText:{
        fontFamily:'Tajawal-Bold', 
        color: textColor,
        fontSize:13
    },
    cadoo_image:{
        width:25,
        height:25,
    },
    cadooWrapperSelected:{
        backgroundColor: btnColorDark,
        color:'white'
    },
    btnwallet:{
    
        marginTop: 13,
        borderRadius:5,
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'center',
       flexDirection:'row',
        backgroundColor: 'brown',
        width:'auto',
        minWidth:140,
        paddingVertical:10,
        paddingHorizontal:6
      },
      btn2Text:{
       color:'white',
       fontFamily:'Tajawal-Bold',
        fontSize:12.5,
        marginVertical:2.5
      },

      error:{
        color:'red',
        fontFamily:'Tajawal-Bold',
        marginBottom:6,
        alignSelf:'center',
        fontSize:13,
        // position:'absolute'
    },
});

export default styles;