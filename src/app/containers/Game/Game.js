import React from 'react';
import debug from 'debug';

import { randomRange, json } from '../../utils';
import Hand from './hand';
import Question from '../../components/Question/Question';
import Answer from '../../components/Answer/Answer';

debug('lego:Game');

const DECK = 87;
export const Error = ({ error }) => {
  if (typeof error !== 'string') {
    return <p className="error">{String(error)} <strong>needs to be handled, was not a string</strong></p>;
  }
  return <p className="error">Error Loading cards!<span>{String(error)}</span></p>;
};
export const Loading = () => <p className="loading">Loading hand....</p>;
const getCard = (api, cardId) => json.get(`http://swapi.co/api/${api}/${cardId}/`);

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      loading: false,
      showAnswer: false,
      attempt: null
    };
    this.deal = this.deal.bind(this);
    this.viewAnswer = this.viewAnswer.bind(this);
    this.setAttempt = this.setAttempt.bind(this);
  }

  componentDidMount() {
    this.deal();
  }

  deal() {
    const cardsIds = randomRange(1, DECK, 2);
    const gameType = 'people';
    const promises = [getCard(gameType, cardsIds[0]), getCard(gameType, cardsIds[1])];
    this.setState({
      error: false,
      loading: true
    });
    return Promise.all(promises)
      .then((cards) => {
        const hand = new Hand(cards);
        this.setState({
          hand: {
            cards,
            question: hand.question,
            answerId: hand.answerId,
            answer: hand.answer
          },
          loading: false
        });
      })
      .catch((e) => {
        this.setState({
          error: e,
          loading: false
        });
      });
  }

  setAttempt(attempt) {
    this.setState({ attempt });
  }

  viewAnswer() {
    this.setState({ showAnswer: true });
  }

  render() {
    const {
      error, loading, showAnswer, attempt, hand: {
        cards = [], question, answer, answerId
      } = {}
    } = this.state;

    return (
      <div id="game">
        <header className="header">
          <h1>Star Wars Trivia</h1>
          <p>A simple game using <a href="http://www.swapi.com" target="_blank">SWAPI</a>.</p>
        </header>
        <button onClick={() => this.deal()}>Deal cards!</button>
        {error && <Error error={ error } />}
        {loading ?
          <Loading /> :
          <Question { ...{
            showAnswer, answer, cards, attempt, onClick: this.setAttempt
          } }>
            {question}
          </Question>
        }
        {!!cards.length && (
          <button className="game__btn--show-answer" onClick={() => this.viewAnswer()}>
            View Answer
          </button>
        ) }
        {!!cards.length && (
          <Answer cards={ cards } answerId={ answerId } showAnswer={ showAnswer } />
        ) }
      </div>
    );
  }
}
