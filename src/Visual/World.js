import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import MouseInput from './mouseinput'
class World extends React.Component {
  constructor (props, context) {
    super(props, context);

    this.cameraPosition = new THREE.Vector3(0, 0, 20);

    this.frame = 0;


    this._onAnimate = (a) => {
      this.frame++;
      props.onAnimate(this.frame);
      // we will get this callback every frame
    };
  }

  componentDidMount () {
    const {
      mouseInput,
      container
    } = this.refs;

    if (!mouseInput.isReady()) {
      const {
        scene,
        camera,
      } = this.refs;

      mouseInput.ready(scene, container, camera);
      // mouseInput.restrictIntersections(this.meshes);
      mouseInput.setActive(false);
    }
  }

  render () {
    const width = window.innerWidth; // canvas width
    const height = window.innerHeight; // canvas height

    return (
      <div ref="container">

        <React3
          mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
          width={width}
          height={height}
          onAnimate={this._onAnimate}
        >
          <module
            ref="mouseInput"
            descriptor={MouseInput}
          />
          <scene
            ref="scene"
          >
            <perspectiveCamera
              ref="camera"
              name="camera"
              fov={75}
              aspect={width / height}
              near={0.1}
              far={1000}
              position={this.cameraPosition}
            />
            {this.props.children}

          </scene>
        </React3>
      </div>
    );
  }
}
export default /*observer*/(World)