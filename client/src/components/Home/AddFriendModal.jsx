import { Modal } from "@chakra-ui/modal"
import { ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/modal"
import { ModalOverlay, Button, Heading } from "@chakra-ui/react"
import { Formik, Form } from "formik"
import TextField from "../TextField"
import * as Yup from 'yup'
import socket from '../../socket'
import { useCallback, useContext, useState } from "react"
import { FriendContext } from "./Home"

const AddFriendModal = ({isOpen, onClose}) => {
    const [error, setError] = useState("");
    const closeModal = useCallback(() => {
        setError("");
        onClose();
    }, [onClose] );
    const {setFriendList} = useContext(FriendContext);
  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay/>
        <ModalContent>
            <ModalHeader>Add a friend</ModalHeader>
            <Heading as="p" color="red.500" textAlign="center" fontSize="xl">{error}</Heading>
            <ModalCloseButton/>
            <Formik 
            initialValues={{friendName: ""}} 
            validationSchema= {Yup.object({
                friendName: Yup.string().required("Username required").min(6, "Invalid Username").max(28, "Invalid Username"),
            })}
            onSubmit={(values, actions) => {
                socket.emit("add_friend", values.friendName, ({errorMsg, done, newFriend}) => {
                    if(done){
                        setFriendList(c => [newFriend, ...c])
                        closeModal();
                        return ;
                    }
                    setError(errorMsg);

                });
            }}
            >
                <Form>
            <ModalBody>
                <TextField label="Friend's name" placeholder="Enter friend's username.." autoComplete="off" name="friendName"/>
            </ModalBody>
            <ModalFooter>
                <Button colorScheme="blue" type="submit">
                    Submit
                </Button>
            </ModalFooter>
            </Form>
            </Formik>
        </ModalContent>
    </Modal>
  )
}

export default AddFriendModal