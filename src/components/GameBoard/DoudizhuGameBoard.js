import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import { Layout } from 'element-react';
import React from 'react';
import '../../assets/doudizhu.scss';
import Landlord_wName from '../../assets/images/Portrait/Landlord_wName.png';
import Peasant_wName from '../../assets/images/Portrait/Peasant_wName.png';
import PlaceHolderPlayer from '../../assets/images/Portrait/Player.png';
import { computeHandCardsWidth, millisecond2Second, sortDoudizhuCards, translateCardData } from '../../utils';

class DoudizhuGameBoard extends React.Component {
    constructor(props) {
        super(props);

        this.isSelectingCards = false;
        this.selectingCards = { start: null, cards: [] };
        this.state = {
            highlightedCards: [],
        };
    }

    computePlayerPortrait(playerId, playerIdx) {
        if (this.props.playerInfo.length > 0) {
            return this.props.playerInfo[playerIdx].role === 'landlord' ? (
                <div>
                    <img src={Landlord_wName} alt={'Landlord'} height="70%" width="70%" />
                    <Chip avatar={<Avatar>ID</Avatar>} label={playerId} color="primary" />
                </div>
            ) : (
                <div>
                    <img src={Peasant_wName} alt={'Peasant'} height="70%" width="70%" />
                    <Chip avatar={<Avatar>ID</Avatar>} label={playerId} color="primary" />
                </div>
            );
        } else
            return (
                <div>
                    <img src={PlaceHolderPlayer} alt={'Player'} height="70%" width="70%" />
                    <Chip avatar={<Avatar>ID</Avatar>} label={playerId} color="primary" />
                </div>
            );
    }

    handleContainerMouseLeave() {
        if (this.isSelectingCards) {
            console.log('container leave');
            this.isSelectingCards = false;
            this.selectingCards = { start: null, cards: [] };
            this.setState({ highlightedCards: [] });
        }
    }

    handleContainerMouseUp() {
        if (this.isSelectingCards) {
            console.log('container up');
            this.isSelectingCards = false;
            this.props.handleSelectedCards(this.selectingCards.cards);
            this.selectingCards = { start: null, cards: [] };
            this.setState({ highlightedCards: [] });
        } else {
            this.props.handleMainPlayerAct('deselect');
        }
    }

    handleCardMouseDown(card, idx) {
        console.log('down');
        this.isSelectingCards = true;
        this.selectingCards.start = idx;
        this.selectingCards.cards = [card];
        this.setState({ highlightedCards: this.selectingCards.cards });
        console.log(this.selectingCards);
    }

    handleCardMouseOver(allCards, card, idx) {
        if (this.isSelectingCards) {
            console.log('over');
            let tmpCards;
            if (idx > this.selectingCards.start) {
                tmpCards = allCards.slice(this.selectingCards.start, idx + 1);
            } else if (idx < this.selectingCards.start) {
                tmpCards = allCards.slice(idx, this.selectingCards.start + 1);
            } else {
                tmpCards = [card];
            }
            this.selectingCards = { ...this.selectingCards, cards: tmpCards };
            this.setState({ highlightedCards: this.selectingCards.cards });
        }
    }

    computeSingleLineHand(inputCards, fadeClassName = '', cardSelectable = false) {
        if (inputCards === '1' || inputCards === 1) {
          return (
              <div className="non-card">
                  <span>BID</span>
              </div>
          );
        }
        if (inputCards === '0' || inputCards === 0) {
          return (
              <div className="non-card">
                  <span>PASS</span>
              </div>
          );
        }
        const cards = inputCards === 'pass' ? inputCards : sortDoudizhuCards(inputCards);
        if (cards === 'pass') {
            return (
                <div className="non-card">
                    <span>PASS</span>
                </div>
            );
        } else {
            return (
                <div
                    className={`playingCards loose ${fadeClassName} ${
                        this.props.gamePlayable && cardSelectable ? 'selectable' : 'unselectable'
                    }`}
                >
                    <ul className="hand" style={{ width: computeHandCardsWidth(cards.length, 12) }}>
                        {cards.map((card, idx) => {
                            const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                            let selected = false;
                            if (this.props.gamePlayable && cardSelectable) {
                                selected = this.props.selectedCards.indexOf(card) >= 0;
                            }

                            return (
                                <li key={`handCard-${card}`}>
                                    <label
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            cardSelectable && this.handleCardMouseDown(card, idx);
                                        }}
                                        onMouseOver={(e) => {
                                            e.stopPropagation();
                                            cardSelectable && this.handleCardMouseOver(cards, card, idx);
                                        }}
                                        // onClick={() => this.props.handleSelectedCards([card])}
                                        className={`card ${rankClass} ${suitClass} ${selected ? 'selected' : ''} ${
                                            cardSelectable && this.state.highlightedCards.includes(card)
                                                ? 'user-selecting'
                                                : ''
                                        }`}
                                    >
                                        <span className="rank">{rankText}</span>
                                        <span className="suit">{suitText}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }

    computeSideHand(cards) {
        let upCards;
        let downCards = [];
        if (cards.length > 10) {
            upCards = cards.slice(0, 10);
            downCards = cards.slice(10);
        } else {
            upCards = cards;
        }
        return (
            <div>
                <div className="player-hand-up">
                    <div className="playingCards unselectable loose">
                        <ul className="hand">
                            {upCards.map((card) => {
                                const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                                return (
                                    <li key={`handCard-${card}`}>
                                        <label
                                            className={`card ${
                                                this.props.showCardBack ? 'back' : '' + rankClass + ' ' + suitClass
                                            }`}
                                        >
                                            <span className="rank">{rankText}</span>
                                            <span className="suit">{suitText}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <div className="player-hand-down">
                    <div className="playingCards unselectable loose">
                        <ul className="hand">
                            {downCards.map((card) => {
                                const [rankClass, suitClass, rankText, suitText] = translateCardData(card);
                                return (
                                    <li key={`handCard-${card}`}>
                                        <label
                                            className={`card ${
                                                this.props.showCardBack ? 'back' : '' + rankClass + ' ' + suitClass
                                            }`}
                                        >
                                            <span className="rank">{rankText}</span>
                                            <span className="suit">{suitText}</span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    playerDecisionArea(playerIdx) {
        let fadeClassName = '';
        if (this.props.toggleFade === 'fade-out' && (playerIdx + 2) % 3 === this.props.currentPlayer)
            fadeClassName = 'fade-out';
        else if (this.props.toggleFade === 'fade-in' && (playerIdx + 1) % 3 === this.props.currentPlayer)
            fadeClassName = 'scale-fade-in';
        if (this.props.currentPlayer === playerIdx) {
            if (this.props.mainPlayerId === this.props.playerInfo[this.props.currentPlayer].id) {
                if (this.props.gameStatus === 'biding') {
                  return (
                      <div className={'main-player-action-wrapper'}>
                          <div style={{ marginRight: '2em' }} className={'timer ' + fadeClassName}>
                              <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                          </div>
                          {this.props.gamePlayable ? (
                              <>
                                  <Button
                                      disabled={false}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          this.props.handleMainPlayerBid('pass');
                                      }}
                                      style={{ marginRight: '2em' }}
                                      variant="contained"
                                      color="primary"
                                  >
                                      Pass
                                  </Button>
                                  <Button
                                      disabled={false}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          this.props.handleMainPlayerBid('bid');
                                      }}
                                      variant="contained"
                                      color="primary"
                                  >
                                      Bid
                                  </Button>
                              </>
                          ) : undefined}
                      </div>
                  );
                }
                return (
                    <div className={'main-player-action-wrapper'}>
                        <div style={{ marginRight: '2em' }} className={'timer ' + fadeClassName}>
                            <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                        </div>
                        {this.props.gamePlayable ? (
                            <>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.handleMainPlayerAct('deselect');
                                    }}
                                    style={{ marginRight: '2em' }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Deselect
                                </Button>
                                <Button
                                    disabled={this.props.isHintDisabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.handleMainPlayerAct('hint');
                                    }}
                                    style={{ marginRight: '2em' }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Hint
                                </Button>
                                <Button
                                    disabled={this.props.isPassDisabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.handleMainPlayerAct('pass');
                                    }}
                                    style={{ marginRight: '2em' }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Pass
                                </Button>
                                <Button
                                    disabled={!this.props.selectedCards || this.props.selectedCards.length === 0}
                                    onClick={(e) => {
                                        console.log('play', e.stopPropagation);
                                        e.stopPropagation();
                                        this.props.handleMainPlayerAct('play');
                                    }}
                                    variant="contained"
                                    color="primary"
                                >
                                    Play
                                </Button>
                            </>
                        ) : undefined}
                    </div>
                );
            } else {
                return (
                    <div className={'timer ' + fadeClassName}>
                        <div className="timer-text">{millisecond2Second(this.props.considerationTime)}</div>
                    </div>
                );
            }
        } else {
            return this.computeSingleLineHand(this.props.latestAction[playerIdx], fadeClassName);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.props.runNewTurn &&
            prevProps.turn !== this.props.turn &&
            this.props.turn !== 0 &&
            this.props.gameStatus === 'playing'
        ) {
            // new turn starts
            this.props.runNewTurn(prevProps);
        }
    }

    render() {
        // compute the id as well as index in list for every player
        const bottomId = this.props.mainPlayerId;
        let found = this.props.playerInfo.find((element) => {
            return element.id === bottomId;
        });
        const bottomIdx = found ? found.index : -1;
        const rightIdx = bottomIdx >= 0 ? (bottomIdx + 1) % 3 : -1;
        const leftIdx = rightIdx >= 0 ? (rightIdx + 1) % 3 : -1;
        let rightId = -1;
        let leftId = -1;
        if (rightIdx >= 0 && leftIdx >= 0) {
            found = this.props.playerInfo.find((element) => {
                return element.index === rightIdx;
            });
            if (found) rightId = found.id;
            found = this.props.playerInfo.find((element) => {
                return element.index === leftIdx;
            });
            if (found) leftId = found.id;
        }
        return (
            <div
                className="doudizhu-wrapper"
                onMouseLeave={(e) => {
                    e.stopPropagation();
                    this.handleContainerMouseLeave();
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    this.handleContainerMouseUp();
                }}
            >
                <div
                    id={'gameboard-background'}
                    className={
                        this.props.gameStatus === 'ready' && this.props.gamePlayable ? 'blur-background' : undefined
                    }
                >
                    <div id={'left-player'}>
                        <div className="player-main-area">
                            <div className="player-info">{this.computePlayerPortrait(leftId, leftIdx)}</div>
                            {leftIdx >= 0 ? (
                                this.computeSideHand(this.props.hands[leftIdx])
                            ) : (
                                <div className="player-hand-placeholder">
                                    <span>Waiting...</span>
                                </div>
                            )}
                        </div>
                        <div className="played-card-area">{leftIdx >= 0 ? this.playerDecisionArea(leftIdx) : ''}</div>
                    </div>
                    <div id={'right-player'}>
                        <div className="player-main-area">
                            <div className="player-info">{this.computePlayerPortrait(rightId, rightIdx)}</div>
                            {rightIdx >= 0 ? (
                                this.computeSideHand(this.props.hands[rightIdx])
                            ) : (
                                <div className="player-hand-placeholder">
                                    <span>Waiting...</span>
                                </div>
                            )}
                        </div>
                        <div className="played-card-area">{rightIdx >= 0 ? this.playerDecisionArea(rightIdx) : ''}</div>
                    </div>
                    <div id={'bottom-player'}>
                        <div className="played-card-area">
                            {bottomIdx >= 0 && (this.props.gameStatus === 'playing' || this.props.gameStatus === 'biding') ? this.playerDecisionArea(bottomIdx) : ''}
                        </div>
                        <div className="player-main-area">
                            <div className="player-info">{this.computePlayerPortrait(bottomId, bottomIdx)}</div>
                            {bottomIdx >= 0 ? (
                                <div className="player-hand">
                                    {this.computeSingleLineHand(this.props.hands[bottomIdx], '', true)}
                                </div>
                            ) : (
                                <div className="player-hand-placeholder">
                                    <span>Waiting...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {this.props.gamePlayable && this.props.gameStatus === 'ready' ? (
                    <Layout.Row
                        type="flex"
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            onClick={() => this.props.firstClick()}
                            style={{ width: '225px' }}
                            variant="contained"
                            color="primary"
                            startIcon={<img src={Peasant_wName} alt="Peasant" width="48px" height="48px" />}
                        >
                            Start Game
                        </Button>
                    </Layout.Row>
                ) : undefined}
            </div>
        );
    }
}

export default DoudizhuGameBoard;
