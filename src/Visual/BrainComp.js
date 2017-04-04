import React, { Component } from 'react';
import NeuronComp from './NeuronComp'
import * as THREE from 'three';
import { rand0to1_F, randMin1to1_F } from './../utils'


class BrainComp extends Component {
  constructor (props) {
    super(props);
    this.props.brain.neurons.forEach(n => {
      if(n.isInput){
        n.color = new THREE.Color( 0xffffff )
      } else if(n.isOutput){

        n.color = new THREE.Color(0x0000ff);
      } else {
        // n.color = new THREE.Color(rand0to1_F(), rand0to1_F(), rand0to1_F());
        n.color = new THREE.Color(0xff00ff);
      }
      n.position = new THREE.Vector3(randMin1to1_F() * 10, randMin1to1_F() * 10, 0)
    });
  }

  renderConnection(from, to, strength){
    // const colors = strength > 0
    //   ? [new THREE.Color(0.8,0,0), new THREE.Color(0.9,0,0)]
    //   : [new THREE.Color(0,0.8,0), new THREE.Color(0,0.9,0)];
    const color= strength > 0 ? new THREE.Color(0,0.8,0) : new THREE.Color(0.8,0,0);
    const fromPosition = from.position.clone();
    fromPosition.setX(fromPosition.x+0.02); //slight change in place to see both directions
    const toPosition = to.position.clone();
    toPosition.setY(toPosition.y+0.01);
    var direction = toPosition.clone().sub(fromPosition);
    var length = direction.length();


    return (
      <arrowHelper
        key={`${from.name}-${to.name}`}
        origin={fromPosition}
        dir={direction.normalize()}
        length={length}
        color={color}
        headWidth={Math.abs(strength)}
        headLength={Math.min(length * 0.2, 1)}
      >
      </arrowHelper>
    );
    // return (
    //   <line key={`${from.name}-${to.name}`}>
    //     <geometry
    //       colors={colors}
    //       vertices={[
    //         fromPosition,
    //         toPosition
    //       ]}
    //     />
    //     <lineBasicMaterial
    //       opacity={strength**2}
    //       transparent
    //       vertexColors={THREE.VertexColors}
    //     />
    //   </line>
    // )

  }

  renderNeurons () {
    return this.props.brain.neurons.map((n, i) => {
      const color = n.color;
      const position = n.position;
      const connections = n.connections.map(c =>{
        const {dest, strength} = c;
        return this.renderConnection(n, dest, strength)
      });
      return (
        <object3D key={n.name}>
          {connections}
          <NeuronComp neuron={n} color={color} position={position}/>
        </object3D>
      )
    })
  }

  render () {
    return (
      <object3D>
        {this.renderNeurons()}
      </object3D>

    );
  }
}

export default /*observer*/(BrainComp);
