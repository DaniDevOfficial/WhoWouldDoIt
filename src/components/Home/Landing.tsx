import { Button, Flex, Heading, Input, useToast, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../configs/socket';

export function Landing() {
    const [roomId, setRoomId] = useState("");
    const [isCreateButtonDisabled, setIsCreateButtonDisabled] = useState(false); // Track button state
    const toast = useToast();
    const navigate = useNavigate();

    function joinRoom() {
        if (roomId === "") {
            return;
        }
        socket.emit("check if room exists", roomId);
    }

    function createRoom() {
        if (isCreateButtonDisabled) {
            return;
        }

        setIsCreateButtonDisabled(true); // Disable button
        socket.emit("create");

        setTimeout(() => {
            setIsCreateButtonDisabled(false); // Re-enable button after 1 second
        }, 1000);
    }

    useEffect(() => {
        function handleRoomDoesNotExist() {
            setRoomId("");
            toast({
                title: "This Lobby does not exist!",
                description: `Are you sure that that was the right code?`,
                status: "error",
            });
        }
        function RoomCreated(data: string) {
            toast({
                title: "Room Created",
                description: `You have created the Lobby ${data}`,
                status: "success",
            });
            navigate(`/lobby/${data}`);
        }

        function handleRoomExists(data: string) {
            toast({
                title: "Joined Room",
                description: `You have joined the Lobby ${data}`,
                status: "success",
            });
            navigate(`/lobby/${data}`);
        }

        socket.on("create", RoomCreated);
        socket.on("room does not exist", handleRoomDoesNotExist);
        socket.on("room exists", handleRoomExists);
        socket.on("created", RoomCreated);

        return () => {
            socket.off("room does not exist", handleRoomDoesNotExist);
            socket.off("room exists", handleRoomExists);
            socket.off("created", RoomCreated);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Heading>Hey There👋, Welcome to MostLikely </Heading>
            <Text fontSize={"x-small"} > If the Lobby doesn't start instatly please hold for a minute because the backend shuts down during inactivity.</Text>
            <Flex
                flexDirection={{ base: "column", md: "row" }}
                justifyContent="center"
                mt={10}
                gap={{ base: 4, md: 40 }}
                mb={"20vh"}
            >
                <Flex
                    flexDirection="column"
                    gap={4}
                >

                    <Heading fontSize="larger">Join a game with a code</Heading>
                    <Input placeholder="Enter a lobby Code" required value={roomId} onChange={(e) => (setRoomId(e.target.value))} />
                    <Button type="submit" colorScheme="pink" onClick={joinRoom}>Click to join</Button>

                </Flex>
                <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    gap={4}
                >
                    <Heading fontSize="larger">Or create your own lobby</Heading>
                    <Button type="submit" colorScheme="pink" onClick={createRoom} isDisabled={isCreateButtonDisabled}>Create a new room</Button>
                </Flex>
            </Flex>
            
        </>
    )
}
