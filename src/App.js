import React, { Component } from 'react';

import './App.css';
import BrainComp from './Visual/BrainComp';
import CreatureComp from './Visual/CreatureComp';
import World from './Visual/World';
import { Creature } from './brain';
import { rangeNum } from './utils';
const range = require('lodash/range');
const slice = require('lodash/slice');

const creatures = range(12).map(i => {
  const xpos = rangeNum(i, 0, 10, -14, 14);
  return new Creature({ name: `c${i}`, startPosition: [xpos, -14] });
});

class App extends Component {
  constructor () {
    super();
    this.state = {
      creatures,
      selectedCreature: creatures[6],

    };
    this.updateFrame = this.updateFrame.bind(this);
    this.handleCreatureClick = this.handleCreatureClick.bind(this);
  }

  handleClick () {
    this.state.creatures.forEach(c => {
      c.updateTime();
    });
  }

  updateFrame (frameNum) {
    if(this.end){return;}
    const {creatures} = this.state;

    if(frameNum % 500 === 0){
      this.end = true;
      creatures.forEach(c =>{
        c.die();
      });

      const yDestination = 10;
      console.log('finish generation 1');
      const sortedCreatures = creatures.sort((a,b) => {
        // a.die();
        if(
          Math.abs(b.position[1] - yDestination) < Math.abs(a.position[1] - yDestination)
        ){ return 1 }
        return -1
      });

      const bestCreatures = slice(sortedCreatures, 0, 3);
      console.log(bestCreatures);


    }
    if (frameNum % 1 === 0) {
      creatures.forEach(c => {
        c.updateTime(frameNum);
      });
    }
  }

  handleCreatureClick (i) {
    this.setState({ selectedCreature: false }, ()=>{
      this.setState({ selectedCreature: creatures[i]})
    })
  }

  renderCreatures () {
    return this.state.creatures.map((c,i) => {
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
