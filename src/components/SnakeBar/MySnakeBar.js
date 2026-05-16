import React from "react";
import { Snackbar } from "react-native-paper";
import { useDispatch , useSelector} from "react-redux";
import { CHANGE_SNAKE_STATUS } from "../../redux/actions/ActionTypes";


export function MySnakeBar(){
    const dispatch = useDispatch();
    const status = useSelector(state => state.myApp.snake_status);
    const msg = useSelector(state => state.myApp.snake_msg);

    const onDismissSnackBar = () => {
       dispatch({
        type : CHANGE_SNAKE_STATUS,
        payload : {
            status: false,
            msg: '',
        },
    })
    }
    return (
        <Snackbar
            style={{position:'absolute',zIndex:9999999999999999,bottom:80}}
            visible={status}
            onDismiss={onDismissSnackBar}
            action={{
            label: 'OK',
            onPress:  onDismissSnackBar
            }}>
            {msg}
        </Snackbar>
    )
}
