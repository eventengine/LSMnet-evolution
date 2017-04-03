import React, { Component } from 'react';

import './App.css';
import BrainComp from './Visual/BrainComp';
import CreatureComp from './Visual/CreatureComp';
import World from './Visual/World';
import { Creature } from './brain';
import { rangeNum } from './utils';
const range = require('lodash/range');

// const c = new Creature({name: 'cc', startPosition: [-14,-15]});
const creatures = range(10).map(i => {
  const xpos = rangeNum(i, 0, 10, -14, 14);
  return new Creature({ name: `c${i}`, startPosition: [xpos, -14] });
});

class App extends Component {
  constructor () {
    super();
    this.state = { selectedCreature: creatures[6] }
    this.handleCreatureClick = this.handleCreatureClick.bind(this);
  }

  handleClick () {
    creatures.forEach(c => {
      c.updateTime();
    });
  }

  updateFrame (frameNum) {
    if (frameNum % 10 === 0) {
      creatures.forEach(c => {
        // c.updateTime(frameNum);
      });
    }
  }

  handleCreatureClick (i) {
    this.setState({ selectedCreature: false }, ()=>{
      this.setState({ selectedCreature: creatures[i]})
    })
  }

  renderCreatures () {
    return creatures.map((c,i) => {
      return <CreatureComp
        selected={c === this.state.selectedCreature}
        creature={c}
        key={c.name}
        i={i}
        handleClick={this.handleCreatureClick}
      />;
    })
  }



  render () {
    return (
      <div className="App">
        <button onClick={this.handleClick}>click</button>

        <World onAnimate={this.updateFrame}>
          {this.renderCreatures()}
          {this.state.selectedCreature && <BrainComp brain={this.state.selectedCreature.brain}/>}
        </World>
      </div>
    );
  }
}

export default /*observer*/(App);
