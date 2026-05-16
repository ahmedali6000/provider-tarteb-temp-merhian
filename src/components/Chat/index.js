import React from 'react'
import { ChatItem } from 'react-chat-elements/native'
import { View } from 'react-native'

const ChatItemC = (props) =>  {
    const {photo,alt,name,msg,date,unread} = props
    return (

        
             <ChatItem
                avatar={photo}
                avatarFlexible={true}
                alt={alt}
                title={name}
                subtitle={msg}
                date={date}
                unread={unread}
            />  
       
        );

}

export default ChatItemC;
