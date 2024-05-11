import { useContext } from 'react';
import { Formik,Form, Field } from 'formik';
import * as Yup from 'yup';
import { HStack, Input, Button } from '@chakra-ui/react';
import { MessagesContext } from './Home';
import socket from '../../socket';


const ChatBox = ({userid}) => {
    const {setMessages} = useContext(MessagesContext);
  return (
    <Formik initialValues={{message: ""}}
    validationSchema={Yup.object({
        message: Yup.string().min(1).max(255),
    })}
    onSubmit={(values, actions) => {

        const message = {to: userid, from: null, content: values.message}
        if(values.message === "") return;
        socket.emit("dm", message);
        setMessages(prevMsgs => [message, ...prevMsgs])
        actions.resetForm();
    }}>
        <HStack as={Form} w="100%" px="1.4rem" pb="1.4rem">
            <Input as={Field} name="message" placeholder="Type a message..." autoComplete="off" size="lg"/>
            <Button type="submit" size="lg" colorScheme="teal" >Send</Button>
        </HStack>

    </Formik>
  )
}

export default ChatBox