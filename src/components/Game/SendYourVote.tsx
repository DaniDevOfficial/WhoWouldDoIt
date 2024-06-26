import { Flex, Heading, Button, Text, useColorMode } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { socket } from '../../configs/socket'
import { PlayerVoteForm } from '../PlayerVoteForm'
import { TitleBoxWithSub } from '../TitleBoxWithSub';

export function SendYourVote({ roomInformation, userState, setUserState }) {
    const { toggleColorMode, colorMode } = useColorMode();

    const [selectedPlayer, setSelectedPlayer] = useState("");
    const currentQuestion = roomInformation.questions.find(question => question.id === roomInformation.voting[0]);
    const [timeLeft, setTimeLeft] = useState(roomInformation.game?.settings.VoteTime || 0);
    const amountOfPlayers = roomInformation.players.length || 0;
    const amountFinishedWriting = (currentQuestion.votes && currentQuestion.votes.length) || 0;
    const allPlayers = roomInformation.players;

    useEffect(() => {
        setSelectedPlayer("");
        setUserState("questionVoteTime");
    }, []);


    useEffect(() => {
        if (timeLeft === 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    useEffect(() => {
        socket.on("finish voting", (forWhichQuestion) => {
            if (forWhichQuestion !== currentQuestion.id) return console.log("This is the wrong question");
            if (currentQuestion.votes && currentQuestion.votes.some(vote => vote.fromWhoId === socket.id)) {
                return;
            }
            console.log(`Voted for ${selectedPlayer} in question ${currentQuestion.id}`);
            let tmpToWho = selectedPlayer;
            if (selectedPlayer === "") {
                tmpToWho = "Hehe This is more than 15 characters long";
            }
            const vote = {
                toWho: tmpToWho,
                fromWhoId: socket.id
            };

            socket.emit("vote", { vote, roomId: roomInformation.roomId, questionId: currentQuestion.id });
        });
        return () => {
            socket.off("finish voting");
        }
    }, [selectedPlayer]);
    function handleVote() {
        if (selectedPlayer) {
            console.log(`Voted for ${selectedPlayer}`);
            const vote = {
                toWho: selectedPlayer,
                fromWhoId: socket.id
            };

            socket.emit("vote", { vote, roomId: roomInformation.roomId, questionId: currentQuestion.id });
            setUserState("questionVoteDone");
        } else {
            console.log("Please select a player to vote for.");

        }
    }
    function getAuthorName(authorId: string) {
        const author = roomInformation.players.find(player => player.playerId === authorId);
        return author?.name || "Unknown";
    }

    return (
        <>
            <Flex
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            >
                <TitleBoxWithSub title="Vote for a Person" subtitle={currentQuestion.question} subSubTitle={`Author: ${getAuthorName(currentQuestion.author)}`} />
                <Text>
                    {amountFinishedWriting} out of {amountOfPlayers} Players {amountFinishedWriting === 1 ? "is" : "are"} Finished with Answering
                    <Text fontWeight="bold">
                        You still have {timeLeft} Second{timeLeft === 1 ? '' : 's'} left
                    </Text>
                </Text>

                {userState === "questionVoteTime" && (
                    <>
                        <PlayerVoteForm
                            allPlayers={allPlayers}
                            handlePlayerSelect={setSelectedPlayer}

                        />

                        <Button colorScheme='pink' onClick={handleVote}>Done Voting</Button>
                    </>
                )}
                {userState === "questionVoteDone" && (
                    <>
                        <Text fontSize={"lg"} mt={3}>You have Voted for: {selectedPlayer}</Text>
                        <Text fontSize={"lg"} mt={3}>Now Wait for the other Players to Finish or until the Timer runs out.</Text>
                    </>
                )
                }
            </Flex>
        </>
    )
}