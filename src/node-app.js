const { autorun } = require('mobx');
var Worker = require('webworker-threads').Worker;

const { firstGenCreature } = require('./brain');

const c = firstGenCreature({xpos:0, startYPosition:-10}); /*?*/
console.log(c);
setInterval(()=>{
  c.updateTime();
  // console.log('p', c.position[1]);

},10)
// console.log(process);
console.log(process.title);
// console.log(process.env);

const bw_script = require('./brain-worker');
var myWorker = new Worker(bw_script);

myWorker.onmessage = (m) => {
  console.log("msg from worker: ", m.data);
};
myWorker.postMessage('im from main');

return
autorun(()=>{
  // console.log(c.position[1]);
  console.log(c.brain.neurons[0].power);
  console.log(c.brain.neurons[0].state);
});