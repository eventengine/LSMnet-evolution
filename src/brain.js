const range = require('lodash/range');
// const mean = require('lodash/mean');
// const sum = require('lodash/sum');
const random = require('lodash/random');

const activation = require('sigmoid');
const { extendObservable } = require('mobx');

const { /*rangeNum,*/ rand0to1_F, randInt, toss, /* randMin1to1_F */ } = require('./utils')

class Organ {
  constructor () {
    if (this.pulse) {
      this.lifePulse = setInterval(this.pulse.bind(this), 500);
    }
  }

  die () {
    this.isDead = true;
    clearInterval(this.lifePulse)
  }
}

const minPower = 0.1;

function multiply99or101 (num) {
  const by = toss() ? 0.99 : 1.01;
  return num * by;
}
function modifyProp (propWeight, evolutionPower) {
  return toss(evolutionPower) ? multiply99or101(propWeight) : propWeight;
}

class Neuron extends Organ {
  constructor ({ base, threshold, leaking, type }) {
    super();
    this.connections = [];
    Object.assign(this, {base, threshold, leaking, type});
    extendObservable(this, { power: minPower * 2 });
  }
  get name(){
    if(this.brain && this.brain.creature && typeof this.index !== 'undefined'){
      return `Neuron_${this.index}_${this.brain.creature.heritageId}`;
    }
  }
  getConnectionMatrix(){
    return this.connections.map(c => c.strength);
  }

  evoluteUnConnected(){
    return new Neuron({
      type: this.type,
      threshold: modifyProp(this.threshold, this.brain.creature.evolutionPower),
      base: modifyProp(this.base, this.brain.creature.evolutionPower),
      leaking: modifyProp(this.leaking, this.brain.creature.evolutionPower)
    });
  }


  get isInput(){
    return this.isOfKindByTypeStringEnd('INPUT')
  }
  get isOutput(){
    return this.isOfKindByTypeStringEnd('OUTPUT')
  }
  isOfKindByTypeStringEnd(typeEnd){
    return !!Object.keys(Neuron.TYPES)
      .filter(k => k.endsWith(typeEnd))
      .find(inputKey => this.type === Neuron.TYPES[inputKey]);
  }



  charge (payload) {
    if (this.isDead) {
      return;
    }

    this.power = Math.max((this.power + payload), 0);
    if (this.power > this.threshold) {
      setTimeout(() => {
        this.fire()
      }, 200);
      this.power = minPower;

    }
  }

  pulse () {
    this.charge(-this.leaking);
  }

  fire () {
    this.connections.forEach(c => {

      if (this.power > 2) console.log(c.strength, this.base, this.power);
      c.dest.charge(/*activation*/(c.strength * this.base ));
    });
    if (this.isOutput) {
      this.brain.creature.outputFire(this.type, this.base);
    }

  }

  die () {
    super.die();
    this.power = 0;
  }

  createConnection (dest, strength) {
    //check if not already connection
    // if (
    //   toss(0.5)
    //   ||
    //   dest.connections.some(c => c.dest === this)
    // ) {
    //   return;
    // }
    this.connections.push({ dest, strength })
  }
}

Neuron.TYPES = {
  REGULAR: Symbol('REGULAR'),
  TIME_INPUT: Symbol('TIME_INPUT'),
  POS_Y_INPUT: Symbol('POS_Y_INPUT'),
  MOVEMENT_OUTPUT: Symbol('MOVEMENT_OUTPUT')
};


const numOfNeurons = 4;


const Brain = class Brain extends Organ {
  constructor ({neurons}) {
    super();

    this.timeInputNeuron = neurons.find(n => n.type === Neuron.TYPES.TIME_INPUT);
    this.posYInputNeuron = neurons.find(n => n.type === Neuron.TYPES.POS_Y_INPUT);

    this.neurons = neurons.map((n,i) => {n.brain = this; n.index = i; return n;})
  }
  get name(){
    if(this.creature){ return 'Brain_' + this.creature.heritageId;}
  }

  getNeuronsConnectionMatrices(){
    return this.neurons.map(n => n.getConnectionMatrix());
  }

  die () {
    this.neurons.forEach(n => n.die());
    // console.log('die: ');
  }

  pulse () {

  }
};




const Creature = class Creature extends Organ {
  constructor ({ heritageId, brain, startYPosition, xpos }) {
    super();
    this.evolutionPower = 0.2;//rand0to1_F();
    this.age = 0;
    Object.assign(this, {startYPosition, heritageId, brain});
    this.brain.creature = this;

    extendObservable(this, {
      position: [xpos, startYPosition]
    });

    // this.getPhenotype();
  }
  get name(){return 'Creature_' + this.heritageId;}

  pulse () {
    this.brain.posYInputNeuron.charge(activation(this.position[1] + 14)) //-14 is starting position

    console.log(
      // 'pulse', this.age
      // evaluate(this.neurons)
    );
    this.age++;
    if (this.age === 20) {
      this.die();
    }
  }

  updateTime (frame) {
    // console.log('updateTime');
    if (this.isDead) {
      return;
    }
    this.brain.timeInputNeuron.charge(0.8);
    // if(frame === 1000){ this.brain.die(); }
  }

  die () {
    super.die();
    this.brain.die();
  }

  moveup (strength) {
    this.position[1] += strength * 0.3;
  }

  outputFire(type, power){
    switch (type){
      case Neuron.TYPES.MOVEMENT_OUTPUT: this.moveup(power);
    }
  }

  getPhenotype () {
    return {
      // generation: this.generation,
      // name: this.name,
      neuronsMatrice: this.brain.neurons.map(n => {
        return [n.base, n.threshold, n.leaking]
          // .concat(n.connections.map(c => c.strength));
        // console.log(a);
      })
    }
  }


  static getRandomHeritageId(){
    return String(randInt(100000,100))
  }

  get generation(){
    return this.heritageId.split('.').length;
  }

  evolute(xpos){
    const neurons = this.brain.neurons.map(n => n.evoluteUnConnected());
    const connectionMatrices = this.brain.getNeuronsConnectionMatrices();

    neurons.forEach((n,i) => {
      neurons.forEach((cn,j) => {
        // if (n !== cn) {
        n.createConnection(
          cn,
          modifyProp(connectionMatrices[i][j], this.evolutionPower)
        );
        // }
      })
    });

    const brain = new Brain({neurons});


    return new Creature({
      brain,
      heritageId: `${this.heritageId}.${Creature.getRandomHeritageId()}`,
      startYPosition: this.startYPosition,
      xpos
    });
  }
};

function firstGenCreature({xpos, startYPosition}){
  const heritageId = Creature.getRandomHeritageId();
  function generateRandNeuron (type) {
    return new Neuron({
      type,
      base: rand0to1_F(),
      leaking: random(0.1, 0.2),
      threshold: random(0.3, 0.8),
    });

  }

  const timeInputNeuron = generateRandNeuron(Neuron.TYPES.TIME_INPUT);
  const posYInputNeuron = generateRandNeuron(Neuron.TYPES.POS_Y_INPUT);

  const movementNeuron = generateRandNeuron(Neuron.TYPES.MOVEMENT_OUTPUT);

  const neurons =
    range(numOfNeurons).map(i => generateRandNeuron(Neuron.TYPES.REGULAR))
      .concat([movementNeuron, timeInputNeuron, posYInputNeuron]);


  neurons.forEach(n => {
    neurons.forEach(cn => {
      // if (n !== cn) {
      n.createConnection(cn, random(-0.5, 0.5, true));
      // }
    })
  });

  const brain = new Brain({ neurons });


  return new Creature({
    brain,
    heritageId,
    startYPosition, xpos
  })
}


module.exports.Creature = Creature;
module.exports.firstGenCreature = firstGenCreature;

