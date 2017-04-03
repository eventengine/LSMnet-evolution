import React, { Component } from 'react';
// import * as THREE from 'three';
import { observer } from 'mobx-react'

import './App.css';
import BrainComp from './Visual/BrainComp';
import CreatureComp from './Visual/CreatureComp';
import World from './Visual/World';
import { Creature } from './brain';


const c = new Creature({name: 'cc', startPosition: [-14,-15]});

class App extends Component {
  constructor () {
    super();
    this.state = { }
  }
  handleClick(){
    c.updateTime();
  }

  updateFrame(frameNum){
    if(frameNum % 100 === 0) {
      c.updateTime(frameNum);
    }
  }
  // componentDidMount () {
  //   setInterval(()=>{
  //     // c.updateTime();
  //   },100);
  // }

  render () {
    return (
      <div className="App">
        <button onClick={this.handleClick}>click</button>

        <World onAnimate={this.updateFrame}>
          <CreatureComp creature={c}/>
          <BrainComp brain={c.brain}/>
        </World>
      </div>
    );
  }
}

export default observer(App);
