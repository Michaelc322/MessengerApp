import {HStack, VStack, Heading, Divider, Text} from '@chakra-ui/layout'
import {Button} from '@chakra-ui/button'
import { ChatIcon } from '@chakra-ui/icons'
import { Tab, TabList } from '@chakra-ui/tabs'
import { FriendContext } from './Home'
import { Circle } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/hooks'
import { useContext } from 'react' 
import AddFriendModal from './AddFriendModal'

const Sidebar = () => {
    const {friendList} = useContext(FriendContext);
    const {isOpen, onOpen, onClose} = useDisclosure();
  return (
    <>
    <VStack py="0.7rem">
        <HStack justify="space-evenly" w="100%">
            <Heading size="md">Add Friend</Heading>
            <Button onClick={onOpen}>
                <ChatIcon/>
            </Button>
        </HStack>
        <Divider/>

        <VStack as={TabList}>
                {friendList.map(friend => (
                    <HStack as={Tab} key={`friend:${friend}`}>
                        <Circle bg={friend.connected ? "green.700" : "red.500"} w="15px" h="15px"/>
                        <Text>{friend.username}</Text>
                    </HStack>
                ))}

        </VStack>
    </VStack>
    <AddFriendModal isOpen={isOpen} onClose={onClose}/>
    </>
    )
}

export default Sidebar