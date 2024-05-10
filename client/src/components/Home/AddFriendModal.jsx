import { Modal } from "@chakra-ui/modal"
import { ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/modal"
import { ModalOverlay, Button } from "@chakra-ui/react"
import { Formik, Form } from "formik"
import TextField from "../TextField"
import * as Yup from 'yup'

const AddFriendModal = ({isOpen, onClose}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay/>
        <ModalContent>
            <ModalHeader>Add a friend</ModalHeader>
            <ModalCloseButton/>
            <Formik 
            initialValues={{friendName: ""}} 
            validationSchema= {Yup.object({
                friendName: Yup.string().required("Username required").min(6, "Invalid Username").max(28, "Invalid Username"),
            })}
            onSubmit={(values, actions) => {
                onClose();
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