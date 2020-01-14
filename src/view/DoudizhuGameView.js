import React from 'react';
import DoudizhuGameBoard from '../components/GameBoard';
import webSocket from "socket.io-client";

class DoudizhuGameView extends React.Component {
    constructor(props) {
        super(props);

        const mainViewerId = 0;     // Id of the player at the bottom of screen
        this.initConsiderationTime = 2;

        this.state = {
            ws: null,
            gameInfo: {
                playerInfo: [],
                hand: [],
                latestAction: [[], [], []],
                mainViewerId: mainViewerId,
                turn: 0,
                currentPlayer: null,
                considerationTime: this.initConsiderationTime,
            },
            gameStateLoop: null
        };
    }

    gameStateTimer() {
        setTimeout(()=>{
            let currentConsiderationTime = this.state.gameInfo.considerationTime;
            if(currentConsiderationTime > 0) {
                currentConsiderationTime--;
                let gameInfo = JSON.parse(JSON.stringify(this.state.gameInfo));
                gameInfo.considerationTime = currentConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.gameStateTimer();
            }else{
                const turn = this.state.gameInfo.turn;
                const gameStateReq = {
                    type: 1,
                    message: {turn: turn}
                };
                let gameInfo = JSON.parse(JSON.stringify(this.state.gameInfo));
                gameInfo.considerationTime = this.initConsiderationTime;
                this.setState({gameInfo: gameInfo});
                this.state.ws.emit("getMessage", gameStateReq);
            }
        }, 1000);
    }

    startReplay() {
        if(this.state.ws !== null){
            const replayReq = {type: 0};
            this.state.ws.emit("getMessage", replayReq);
            // loop to update game state
            this.gameStateTimer();
        }else{
            console.log("websocket not connected");
        }
    };

    connectWebSocket() {
        let ws = webSocket("http://localhost:10080");
        ws.on("getMessage", message => {
            if(message){
                switch(message.type){
                    case 0:
                        // init replay info
                        let gameInfo = JSON.parse(JSON.stringify(this.state.gameInfo));
                        gameInfo.playerInfo = message.message.playerInfo;
                        gameInfo.hand = message.message.initHand.map(element => {
                            return element.split(" ");
                        });
                        // the first player should be landlord
                        gameInfo.currentPlayer = message.message.playerInfo.find(element=>{return element.role === "landlord"}).index;
                        this.setState({gameInfo: gameInfo});
                        break;
                    case 1:
                        // getting player actions
                        console.log(message.message);
                        let res = message.message;
                        if(res.turn === this.state.gameInfo.turn && res.playerIdx === this.state.gameInfo.currentPlayer){
                            let gameInfo = JSON.parse(JSON.stringify(this.state.gameInfo));
                            gameInfo.latestAction[res.playerIdx] = res.move === "P" ? "P" : res.move.split(" ");
                            gameInfo.turn++;
                            gameInfo.currentPlayer = (gameInfo.currentPlayer+1)%3;
                            // todo: take away played cards from player's hand

                            this.setState({gameInfo: gameInfo});
                            this.gameStateTimer();
                        }else{
                            console.log("Mismatched game turn or current player index", message);
                        }
                        break;
                    default:
                        console.log("Wrong message type ", message);
                        break;
                }
            }
        });
        this.setState({ws: ws});
    };

    render(){
        return (
            <div>
                <div style={{width: "960px", height: "540px"}}>
                    <DoudizhuGameBoard
                        playerInfo={this.state.gameInfo.playerInfo}
                        hand={this.state.gameInfo.hand}
                        latestAction={this.state.gameInfo.latestAction}
                        mainPlayerId={this.state.gameInfo.mainViewerId}
                        currentPlayer={this.state.gameInfo.currentPlayer}
                        considerationTime={this.state.gameInfo.considerationTime}
                    />
                </div>
                <div style={{marginTop: "10px"}}>
                    <input type='button' value='Connect' onClick={()=>{this.connectWebSocket()}} />
                    <input style={{marginLeft: "10px"}} type='button' value='Start Replay' onClick={()=>{this.startReplay()}} />
                </div>
            </div>
        )
    }
}

export default DoudizhuGameView;