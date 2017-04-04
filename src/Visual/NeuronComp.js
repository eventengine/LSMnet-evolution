import React, {} from 'react';
import { observer } from 'mobx-react'

function NeuronComp ({ neuron, color, position }) {
  return (
    <object3D>
      <mesh
        position={position}
      >
        <sphereGeometry
          radius={neuron.base}
        />
        <meshBasicMaterial
          color={0xffff00}
          opacity={0.5}
          transparent
        />
      </mesh>
      <mesh
        position={position}
      >

        <ringGeometry
          outerRadius={Math.max(0.01, neuron.power)}
          innerRadius={0.01}
          thetaSegments={7}
          phiSegments={1}

        />
        <meshBasicMaterial
          color={color}
        />
      </mesh>
      <mesh
        position={position}
      >
        <ringGeometry
          outerRadius={neuron.threshold}
          innerRadius={neuron.threshold - 0.05}
          thetaSegments={7}
          phiSegments={1}

        />
        <meshBasicMaterial
          color={color}
        />
      </mesh>
    </object3D>
  )
}


export default observer(NeuronComp);
