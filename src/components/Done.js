import React from "react";
import {View, Text,StyleSheet} from "react-native";
import LottieView from 'lottie-react-native';


export function Done(props){
return ( 
   

       <LottieView
        source={require("./../../assets/loader/done.json")}
        autoPlay
        loop
      />
  );
}
//  <AnimatedLoader
//         visible= {props.done}
//         overlayColor="rgba(255,255,255,0.75)"
//         source={require("./../../assets/loader/done.json")}
//         animationStyle={styles.lottie}
//         speed={1}
//       >
//       </AnimatedLoader>
const styles = StyleSheet.create({
  lottie: {
    width: 170,
    height: 170
  }
});