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
const numOfCreatures = 60;
const creatures = range(numOfCreatures).map(i => {
  const xpos = rangeNum(i, 0, numOfCreatures, -20, 20);
  return firstGenCreature({ /*name: `c${i}`,*/ xpos, startYPosition: -14 });
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


      // console.log('finish generation');
      creatures.forEach(c =>{
        c.die();
      });

      const sortedCreatures = sortBy(creatures, c => Math.abs(c.position[1] - App.yDestination));
      const overalScore = creatures.reduce((p, c) => {
        return p + Math.abs(c.position[1] - App.yDestination)
      },0) / creatures.length;
      console.log(overalScore);

      const bestCreatures = slice(sortedCreatures, 0, 20);

      const nextGenCreatures = []
        .concat(bestCreatures, bestCreatures, bestCreatures)
        .map((c, i) => c.evolute(rangeNum(i, 0, numOfCreatures, -20, 20)));

      setTimeout(()=>{
        this.setState({ creatures: [], selectedCreature: false }, ()=>{
          this.setState({ creatures: nextGenCreatures, selectedCreature: nextGenCreatures[0] }, () => {
            this.end = false
          });
        });
      },3000);
      return;
    }
    if (frameNum % 2 === 0) {
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
