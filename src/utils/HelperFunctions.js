import axios from 'axios';
import React from 'react';
import {View,Text, Linking} from 'react-native';
import Gtyles from '../styles/Gstyle';
import { getI18n } from "react-i18next";
import { domain } from './app';


export const cutLongText = (txt,num = 12) => {
    if (txt.length > num) {
        return txt.slice(0,num - 3) + '..';
    }
    return txt;
}

export const isSvg = url => {
  return url?.toLowerCase().endsWith('.svg');
};


export const Visit_Sponser = (sponser_id,sponser_link,tokenK) => {
  var config = {method: 'get',url: domain + `/api/visitsponser?sponser_id=${sponser_id}`,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
  axios(config).then(res => {
    Linking.openURL(sponser_link)
  }).catch(err=>{
      alert(err)
  })
}

export const text = (color='black',bold,locale) => { //return object to work as default styke for text.
  
  return text;
}


// export const redirectCategory = (category) => {

// }
export const arabic_num = (v) => { 
      if(v == null || !v){
        return 0;
      }
      
      
     if(getI18n().language == 'en'){
      return v;
    }
    const arabicNumbers = ['۰', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    v = Math.round(v);
  
    var chars = v.toString().split('');
    for (var i = 0; i < chars.length; i++) {
       
      if (/\d/.test(chars[i])) {
        chars[i] = arabicNumbers[chars[i]];
      }
    }
    return chars.join('');
 }
 
export const getRandomColor = () => {
  const red = Math.floor(Math.random() * 128 + 128);
  const green = Math.floor(Math.random() * 128 + 128);
  const blue = Math.floor(Math.random() * 128 + 128);

  const alpha = 0.5; // الشفافية (0 = شفاف تمامًا، 1 = بدون شفافية)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
     
 