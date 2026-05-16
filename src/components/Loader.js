import React from "react";
import {View, Text,StyleSheet} from "react-native";
import LottieView from 'lottie-react-native';


export default function Loader(props){
  const {isLoading,...rest} = props;

  return ( 
  
      <LottieView
         source={require("./../../assets/loader/loader.json")}
        autoPlay
        style={styles.lottie}
        loop
      />
  );
}
  // <AnimatedLoader
    //     visible= {isLoading} 
    //     overlayColor="rgba(255,255,255,1)"
    //     source={require("./../../assets/loader/loader.json")}
    //     animationStyle={styles.lottie}
    //     speed={1}
    //   >
        {/* <Text>Doing something...</Text> */}
      // </AnimatedLoader>
const styles = StyleSheet.create({
  lottie: {
    width: 350,
    height: 350
  }
});