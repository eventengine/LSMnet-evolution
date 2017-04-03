import React, { Component } from 'react';
import NeuronComp from './NeuronComp'
import * as THREE from 'three';
import { rand0to1_F, randMin1to1_F } from './../utils'


class BrainComp extends Component {
  constructor (props) {
    super(props);
    this.props.brain.neurons.forEach(n => {
      n.color = new THREE.Color(rand0to1_F(), rand0to1_F(), rand0to1_F());
      n.position = new THREE.Vector3(randMin1to1_F() * 10, randMin1to1_F() * 10, 0)
    });
  }

  renderConnection(from, to, strength){
    const colors = strength > 0
      ? [new THREE.Color(0.8,0,0), new THREE.Color(0.9,0,0)]
      : [new THREE.Color(0,0.8,0), new THREE.Color(0,0.9,0)];
    return (
      <line key={`${from.name}-${to.name}`}>
        <geometry
          colors={colors}
          vertices={[
            from.position,
            to.position
          ]}
        />
        <lineBasicMaterial
          opacity={strength**2}
          transparent
          vertexColors={THREE.VertexColors}
        />
      </line>
    )

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
