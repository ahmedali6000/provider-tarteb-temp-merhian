import {Dimensions, StyleSheet} from 'react-native';
import { btnColor, btnColorDark, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width / 5;
const ContainerHeight = ContainerWidth;


const styles = StyleSheet.create({
   scondBTN:{
    marginVertical: 7,
    width:165,
    fontSize:13,
    paddingVertical:12,
    alignItems:'center',
    borderRadius:7
  },

    input:{
      fontSize:22,
      fontFamily:'Tajawal-Bold',
      color:btnColorDark,
      // borderColor:'black',
      // borderWidth:1
    },
    inputHeader:{
      fontSize:16,
      marginTop:10,
      fontFamily:'Tajawal-Bold',
      color:btnColor,
      textAlign:'center'
    },
    inputHeader2:{
      fontSize:15,
      marginTop:10,
      fontFamily:'Tajawal-Bold',
      color:btnColor,
      textAlign:'center',
      borderColor:btnColor,
      borderWidth:1,
      padding:10
    },
    inputBesideTxt:{
      fontSize:18,
      fontFamily:'Tajawal-Bold',
      color:btnColorDark,
      marginHorizontal:10
    },
      title:{
        color:textColor,
        fontFamily:'Tajawal-Bold',
        fontSize:18,
        marginTop:30,
        paddingBottom:0,
        borderBottomWidth:1,
        borderBottomColor:'white',
         
      },
      sen:{
        color:btnColorDark,
        fontFamily:'Tajawal-Bold',
        fontSize:14,
        borderBottomColor:btnColorDark,
        borderBottomWidth:1,
        marginVertical:5,
        marginStart:3
      },
      senIcon:{
        color:btnColorDark,
        fontWeight:'bold',
        fontSize:22,
        marginBottom:5,
        marginStart:30
      },
      current:{
        color:'white', 
        fontFamily:'Tajawal-Regular',
        fontSize:16,
        marginBottom:7
        
      },
      current2:{
        color:'white', 
        fontFamily:'Tajawal-Bold',
        fontSize:25,
        
      },
      green:{
        margin:5,
        borderRadius:10,  
        paddingVertical:30,
        flex:1,alignItems:'center',
        justifyContent:'center',
        backgroundColor:btnColor,
        shadowColor: "black",
        shadowOffset: {
            width: 1.5,
            height: 1.5,
        },
        shadowOpacity: 0.5,
        shadowRadius: 1.84,
  
        elevation: 1.5,  
      },
  
  
  
      courtsWrapper:{
        marginTop:20,
        paddingHorizontal:10,
         
        flex:1,
        paddingBottom:15
      },
      courtHeader:{
        fontSize:18,
        
        marginVertical:4,
        color:'white'
      },
  
      //-------------
      itemWrapper2:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginVertical:4,
        borderWidth:1,
        backgroundColor:'white',
        borderColor:btnColor,
        paddingVertical:15,
        paddingHorizontal:15,
        // borderRadius:10
      },
      itemWrapper:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginVertical:4,
       
        paddingVertical:15,
        paddingHorizontal:15,
        borderRadius:10,
        borderBottomColor:'white',
        borderBottomWidth:1
      },
      item_text:{
        fontSize:13,
        
        color:textColor,
        fontFamily:'Tajawal-Bold',
      },
      item_text2:{
        fontSize:13,
        
        color:btnColor,
        fontFamily:'Tajawal-Bold',
      },

});

export default styles;