import React from "react";
import {View,Text,Image} from 'react-native'
import styles from "./style";
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function Stars(props){
    const {rate} = props;

    return (
        <View style={styles.wrapper}>
            {[...Array(rate)].map((x, i) =>
                <Text key={i}>
                <Ionicons name="star" style={[styles.star,{color:'gold'}]} />
                </Text>
            )}
            {[...Array(5-rate)].map((x, i) =>
                <Text key={i}>
                <Ionicons name="star" style={styles.star} />
                </Text>
            )}
            </View>
    );
}