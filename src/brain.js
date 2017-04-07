const range = require('lodash/range');
// const mean = require('lodash/mean');
// const sum = require('lodash/sum');
const random = require('lodash/random');

const activation = require('sigmoid');
const { extendObservable } = require('mobx');

const { rand0to1_F, randInt, toss, /* randMin1to1_F */ } = require('./utils')

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

  clone(){
    this.isDead = false;
    if (this.pulse) {
      this.lifePulse = setInterval(this.pulse.bind(this), 500);
    }
    return Object.assign(Object.create(this), this);
  }
}

const minPower = 0.1;

function multiply99or101 (num) {
  const by = toss() ? 0.99 : 1.01;
  return num * by;
}

class Neuron extends Organ {
  constructor ({ base, name, threshold, leaking, cb,/* isInput,*/ type }) {
    super();

    this.name = 'Neuron_' + name;
    this.base = base;
    this.connections = [];
    // this.payloads = [];
    this.threshold = threshold;
    this.leaking = leaking;
    this.cb = cb;
    // this.isOutput = !!cb;
    this.type = type || Neuron.TYPES.REGULAR;
    // this.isInput = Neuron.TYPES;

    extendObservable(this, { state: base, power: minPower * 2 });

  }

  modify(){
    const newNeuron = this.clone();
    newNeuron.threshold = multiply99or101(this.threshold);
    newNeuron.base = multiply99or101(this.base);
    newNeuron.leaking = multiply99or101(this.leaking);
    return newNeuron;
  }

  static TYPES = {
    REGULAR: Symbol('REGULAR'),
    TIME_INPUT: Symbol('TIME_INPUT'),
    POS_Y_INPUT: Symbol('POS_Y_INPUT'),
    MOVEMENT_OUTPUT: Symbol('MOVEMENT_OUTPUT')
  };

  get isInput(){
    return this.isOfKindByTypeStringEnd('INPUT')
  }
  get isOutput(){
    // return !!this.cb;
    return this.isOfKindByTypeStringEnd('OUTPUT')
  }
  isOfKindByTypeStringEnd(typeEnd){
    return Object.keys(Neuron.TYPES)
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
      // this.cb(this.brain.creature, this.base);
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


const numOfNeurons = 4;


const Brain = class Brain extends Organ {
  constructor ({ heritageId, neurons}) {
    super();
    this.name = 'Brain_' + heritageId;
    // const [movementNeuron, timeInputNeuron, posYInputNeuron] = specialNeurons;

    this.timeInputNeuron = neurons.find(n => n.type === Neuron.TYPES.TIME_INPUT);
    this.posYInputNeuron = neurons.find(n => n.type === Neuron.TYPES.POS_Y_INPUT);

    // this.neurons = normalNeurons.concat(specialNeurons);
    this.neurons = neurons.map(n => {n.brain = this; return n;})
  }

  die () {
    this.neurons.forEach(n => n.die());
    console.log(
      'die: '
    );

  }

  pulse () {

  }
};




const Creature = class Creature extends Organ {
  constructor ({ /*name,*/ heritageId, brain, startPosition }) {
    super();
    // this.evolutionPower = rand0to1_F();
    this.age = 0;
    this.startPosition = startPosition;
    this.heritageId = heritageId;
    this.name = 'Creature_' + this.heritageId;
    this.brain = brain;
    this.brain.creature = this;

    extendObservable(this, {
      position: startPosition
    });

    // this.getPhenotype();
  }

  pulse () {
    this.brain.posYInputNeuron.charge(activation(this.position[1] + 14)) //-14 is starting position

    console.log(
      // 'pulse', this.age
      // evaluate(this.neurons)
    );
    this.age++;
    if (this.age === 100) {
      // this.die();
    }
  }

  updateTime (frame) {
    if(this.generation > 1){
      console.log(this);
    }
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
    if(this.generation > 1){
      console.log(this);
    }
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

  evolute(){
    const newCreature = this.clone();
    newCreature.heritageId = `${this.heritageId}.${Creature.getRandomHeritageId()}`;
    // const fatherGenotype = this.getPhenotype();
    newCreature.age = 0;
    newCreature.position = this.startPosition;
    newCreature.brain = this.brain.clone();
    newCreature.brain.neurons = this.brain.neurons.map(n => n.modify());
    newCreature.timeInputNeuron = newCreature.brain.neurons[1];
    newCreature.posYInputNeuron = newCreature.brain.neurons[2];
    return newCreature;
  }
};
function firstGenCreature({startPosition}){
  const heritageId = Creature.getRandomHeritageId();

  const timeInputNeuron = new Neuron({
    name: heritageId + '_timeInput',
    type: Neuron.TYPES.TIME_INPUT,
    base: rand0to1_F(),
    leaking: random(0.1, 0.2),
    threshold: random(0.3, 1.5),
  });
  const posYInputNeuron = new Neuron({
    name: heritageId + '_posYInput',
    type: Neuron.TYPES.POS_Y_INPUT,
    base: rand0to1_F(),
    leaking: random(0.1, 0.2),
    threshold: random(0.3, 1.5),
  });

  const movementNeuron = new Neuron({
    name: heritageId + '_movementNeuron',
    type: Neuron.TYPES.MOVEMENT_OUTPUT,
    base: rand0to1_F(),
    leaking: random(0.001, 0.2),
    threshold: random(0.3, 1.5),
  });

  const neurons =
    range(numOfNeurons)
      .map(i => new Neuron({
        name: `${heritageId}_${i.toString()}`,
        base: rand0to1_F(),
        leaking: random(0.001, 0.02),
        threshold: random(0.3, 1.2)
      }))
      .concat([movementNeuron, timeInputNeuron, posYInputNeuron]);
  // const neurons = normalNeurons.concat(specialNeurons);


  neurons.forEach(n => {
    neurons.forEach(cn => {
      // if (n !== cn) {
      n.createConnection(cn, random(-0.5, 0.5, true));
      // }
    })
  });

  const brain = new Brain({
    heritageId,
    neurons
  });


  return new Creature({
    brain,
    heritageId,
    startPosition
  })
}

// module.exports = Brain;
module.exports.Creature = Creature;
module.exports.firstGenCreature = firstGenCreature;

