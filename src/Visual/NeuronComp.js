import React, { } from 'react';
import { observer } from 'mobx-react'

function NeuronComp({neuron, color,position}) {
  return (
    <mesh
      position={position}
    >
      <sphereGeometry
        radius={neuron.power}

      />
      <meshBasicMaterial
        color={color}
      />
    </mesh>
  )
}


export default observer(NeuronComp);
