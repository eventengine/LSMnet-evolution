const {createWorkerScript} = require( './utils');


// const { autorun } = require('mobx');
const {firstGenCreature} = require( './brain');
const x = createWorkerScript(firstGenCreature);
// process.env.PUBLIC_URL = x;
// window.qqq = x;
// self.qqq = x;
// console.log(self);
// console.log(window);
const workercode = () => {
  // self.importScripts('mobx', './brain');

  self.onmessage = function({data}) {
    const {type, payload} = data;
    switch (type){
      case 'ADD_DEPENDENCIES':
        console.log(payload);
      case 'CREATE':
        const {xpos , startYPosition} = payload;
        // c = firstGenCreature({xpos , startYPosition});
        // self.postMessage('CREATED', c);
        // autorun(()=>{
        //   // console.log(c.position[1]);
        //   console.log(c.brain.neurons[0].power);
        //   self.postMessage('POS_UPDATE', c.position)
        // });
        break;
      default: break;

    }
  }
};



module.exports = createWorkerScript(workercode);