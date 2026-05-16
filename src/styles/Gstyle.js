import {ScaledSheet} from 'react-native-size-matters';
 import { btnColor , btnColorDark, textColor, textSize } from '../utils/app';
 import {Dimensions, StyleSheet} from 'react-native';


const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const Gtyles = ScaledSheet.create({
    button: {
        
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 8,
        paddingHorizontal:10,
        
        
      }, 
      primaryButton: {
        backgroundColor: btnColor,
      },
      secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        
        borderColor: btnColor,
      },
      primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily:'Tajawal-Bold'
      },
      secondaryButtonText: {
        color: '#005AAC',
        fontSize: 13,
       fontFamily:'Tajawal-Bold'
      },
      modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    modalIconWrapper: {
    marginBottom: 15,
    },
    modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    },
    modalTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 10,
    color: '#000',
    },
    modalText: {
    fontSize: 14,
    lineHeight:22,
    textAlign: 'center',
        fontFamily: 'Tajawal-Regular',
    marginBottom: 20,
    color: '#555',
    },
    ModalprimaryButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 24,
    marginBottom: 10,
    minWidth:'45%',
     borderWidth:1,
     borderColor:'#69d169'
    },
    ModalprimaryButtonText: {
    color: '#fff',
    fontFamily: 'Tajawal-Bold',
    textAlign:'center',
    fontSize:14,
    },
    ModalsecondaryButton: {
    backgroundColor: '#e6ffe6',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 24,
    minWidth:'45%',
    borderWidth:1,
    borderColor:'#69d169'
    },
    ModalsecondaryButtonText: {
    color: 'green',
    fontFamily: 'Tajawal-Bold',
    textAlign:'center',
    fontSize:14,
    
    },
    trad_text:{
        fontSize:textSize,
        fontFamily:'Tajawal-Medium',
    },
    more:{
        backgroundColor:'#81cbff66',
        padding:8,
        color:btnColorDark,
        // borderWidth:1,
        // borderColor:btnColor,
        fontFamily:'Tajawal-Medium',
        fontSize:11,
        borderRadius:20,
        paddingHorizontal:12,
        marginBottom:5
    },
    authBtnStyle:{
        backgroundColor: btnColor,
        padding:10,
        color:'white',
        width:width-100,
        textAlign:'center',
        borderRadius:6,
        
        fontSize:16,
        fontFamily:'Tajawal-Medium',
    },
    fonts:{
        small:15,
        normal:20
    },
    MROW:{
        flexDirection:'row',alignItems:'center'
    },
    newPhoneWrapper:{
        width:'100%',
        paddingHorizontal:-5,
        paddingVertical:-5,
        overflow:'hidden',
        marginVertical: 6,
        borderRadius: 8,
        backgroundColor:'#f2f0f0',
        flexDirection:'column',
    },
    newPhoneInputTextStyle:{
        fontFamily:'Tajawal-Regular',
        fontSize:14,
        backgroundColor:'#f2f0f0',
        marginBottom:-5
    },
    h:{
        marginStart:5,
        fontSize:16,
        marginVertical:6,
        color:btnColorDark,
        fontFamily:'Tajawal-Bold',
    }
    ,
    h_icon:{
        fontSize:19,
        color:btnColorDark,
        fontFamily:'Tajawal-Medium',
    },
    hr:{
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    shadowFullCard:{
        backgroundColor:'white',
        margin:10,
        paddingHorizontal:15,
        paddingVertical:4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,  
    },
    shadow:{
        shadowColor: "#000",
shadowOffset: {
	width: 0,
	height: 2,
},
shadowOpacity: 0.25,
shadowRadius: 3.84,

elevation: 5,  
    },
    btn_shadow:{
        
        shadowColor: "#000",
shadowOffset: {
	width: 0,
	height: 2,
},
shadowOpacity: 0.25,
shadowRadius: 3.84,

elevation: 5,
    },
    errorMSGWrapper:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:"rgba(255, 56, 56, 0.36)",
        padding:20,borderRadius:20 
    },

    errorMSGText:{
        fontSize:13,
        color:'#cc1b00',
        fontFamily:'Tajawal-Medium',
    },

    //counter
    counterWrapper:{
         width:180,
        flexDirection:'row',
        justifyContent:'space-around',
        backgroundColor:'white',
        alignItems:'center',
        paddingHorizontal:2 ,
        paddingVertical:9,
        borderRadius:2,
        borderWidth:1,
        borderColor:'#ddd'

    },
    counterTxt:{
        fontSize:16,
        fontFamily:'Tajawal-Medium',
        color:textColor
    },
    counterIcon:{
        backgroundColor:btnColorDark,
        padding:8,
        color:'white',
        fontSize:14,
        borderRadius:3,
        fontFamily:'Tajawal-Medium',
    },
    warnContainer:{
        backgroundColor:'#92dbe8',
        paddingHorizontal:12,
        paddingVertical:8,
        borderRadius:5

    },
    warnTxt:{
        fontFamily:'Tajawal-Bold',
        color:textColor,
        fontSize:11,
        lineHeight:19,
        alignSelf:'flex-start'
    }
});

export default Gtyles;