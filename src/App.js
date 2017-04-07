import React, { Component } from 'react';
import * as THREE from 'three';

import './App.css';
import BrainComp from './Visual/BrainComp';
import CreatureComp from './Visual/CreatureComp';
import World from './Visual/World';
import { firstGenCreature } from './brain';
import { rangeNum } from './utils';
const range = require('lodash/range');
const slice = require('lodash/slice');
const sortBy = require('lodash/sortBy');

// console.time('a')
const numOfCreatures = 12;
const creatures = range(numOfCreatures).map(i => {
  const xpos = rangeNum(i, 0, 10, -14, 14);
  return firstGenCreature({ /*name: `c${i}`,*/ startPosition: [xpos, -14] });
});
console.log(creatures);

class App extends Component {
  constructor () {
    super();
    this.state = {
      creatures,
      selectedCreature: creatures[6],

    };
    this.updateFrame = this.updateFrame.bind(this);
    this.handleCreatureClick = this.handleCreatureClick.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick () {
    this.state.creatures.forEach(c => {
      c.updateTime();
    });
  }
  static yDestination = 10;

  updateFrame (frameNum) {
    if(this.end){return;}
    const {creatures} = this.state;

    if(frameNum % 500 === 0){
      this.end = true;


      console.log('finish generation 1');

      const sortedCreatures = sortBy(creatures, c => Math.abs(c.position[1] - App.yDestination));

      const bestCreatures = slice(sortedCreatures, 0, 3);

      console.log(bestCreatures);
      const newCreature  = bestCreatures[0].evolute();
      this.setState({ creatures: [], selectedCreature: false }, ()=>{
        this.setState({creatures: [newCreature], selectedCreature: this.state.creatures[0]});
        this.end = false;
      });

      creatures.forEach(c =>{
        c.die();
      });
      return;

    }
    if (frameNum % 100 === 0) {
      creatures.forEach(c => {
        c.updateTime(frameNum);
      });
    }
  }

  handleCreatureClick (i) {
    this.setState({ selectedCreature: false }, ()=>{
      this.setState({ selectedCreature: this.state.creatures[i]})
    })
  }

  renderCreatures () {
    return this.state.creatures.map((c,i) => {
      return <CreatureComp
        selected={c === this.state.selectedCreature}
        creature={c}
        key={c.heritageId}
        i={i}
        handleClick={this.handleCreatureClick}
      />;
    })
  }

  renderTopLine(){
    return (
      <line>
        <geometry
          vertices={[
            new THREE.Vector3(-14, App.yDestination,0),
            new THREE.Vector3(14, App.yDestination, 0),
          ]}
        />
        <lineBasicMaterial
          color={0xffffff}
        />
      </line>
    )

  }


  render () {
    return (
      <div className="App">
        <button onClick={this.handleClick}>click</button>

        <World onAnimate={this.updateFrame}>
          {this.renderTopLine()}
          {this.renderCreatures()}
          {this.state.selectedCreature && <BrainComp brain={this.state.selectedCreature.brain}/>}
        </World>
      </div>
    );
  }
}

export default /*observer*/(App);
