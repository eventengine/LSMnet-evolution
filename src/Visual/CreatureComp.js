import React from 'react';
import * as THREE from 'three';
import { observer } from 'mobx-react'



function CreatureComp({creature, handleClick, i, selected}) {
  const [x,y] = creature.position;
  const pos = new THREE.Vector3(x,y,0);


  return (

    <mesh
      onClick={()=>{handleClick(i);}}
      position={pos}
    >
      <boxGeometry
        width={1}
        height={1}
        depth={1}
      />
      <meshBasicMaterial
        color={selected ? 0x00ff00 : 0xffff00}
      />
    </mesh>
  )
}

export default observer(CreatureComp);
