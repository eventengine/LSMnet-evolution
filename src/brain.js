const range = require('lodash/range');
// const mean = require('lodash/mean');
// const sum = require('lodash/sum');
const random = require('lodash/random');

const activation = require('sigmoid');
const { extendObservable } = require('mobx');

const { rand0to1_F, toss, /* randMin1to1_F */ } = require('./utils')

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


class Neuron extends Organ {
  constructor ({ base, name, threshold, leaking, cb, isInput }) {
    super();

    this.name = 'Neuron_' + name;

    this.base = base;
    this.connections = [];
    this.payloads = [];
    this.threshold = threshold;
    this.leaking = leaking;
    this.cb = cb;
    this.isInput = isInput;
    this.isOutput = !!cb;

    extendObservable(this, { state: base, power: minPower * 2 });

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
    if (this.cb) {
      this.cb(this.base);
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
  constructor (name, specialNeurons) {
    super();
    this.name = 'Brain_' + name;
    this.age = 0;


    this.neurons =
      range(numOfNeurons)
        .map(i => new Neuron({
          name: `${name}_${i.toString()}`,
          base: rand0to1_F(),
          leaking: random(0.001, 0.02),
          threshold: random(0.3, 1.2)
        }))
        .concat(specialNeurons);

    this.neurons.forEach(n => {
      this.neurons.forEach(cn => {
        // if (n !== cn) {
        n.createConnection(cn, random(-0.5, 0.5, true));
        // }
      })
    })
  }

  die () {
    super.die();
    this.neurons.forEach(n => n.die());
    console.log(
      'die: '
    );

  }

  pulse () {
    // console.log(
    //   'pulse', this.age
    //   // evaluate(this.neurons)
    // );
    this.age++;
    if (this.age === 100) {
      this.die();
    }
  }
}


const Creature = class Creature extends Organ {
  constructor ({ name, inputs, outputs, startPosition }) {
    super();
    this.name = 'Creature_' + name;
    this.generation = 0;

    this.heritageId = heritageId;

    extendObservable(this, {
      position: startPosition
    });

    this.timeInputNeuron = new Neuron({
      name: name + '_timeInput',
      base: rand0to1_F(),
      leaking: random(0.1, 0.2),
      threshold: random(0.3, 1.5),
      isInput: true
    });
    this.posYInputNeuron = new Neuron({
      name: name + '_posYInput',
      base: rand0to1_F(),
      leaking: random(0.1, 0.2),
      threshold: random(0.3, 1.5),
      isInput: true
    });

    const movementNeuron = new Neuron({
      name: name + '_movementNeuron',
      base: rand0to1_F(),
      leaking: random(0.001, 0.2),
      threshold: random(0.3, 1.5),
      cb: this.moveup.bind(this)
    });

    this.brain = new Brain(name, [movementNeuron, this.timeInputNeuron, this.posYInputNeuron]);

  }

  pulse () {
    this.posYInputNeuron.charge(activation(this.position[1] + 14)) //-14 is starting position
  }

  updateTime (frame) {
    if (this.isDead) {
      return;
    }
    this.timeInputNeuron.charge(0.8);
    // if(frame === 1000){ this.brain.die(); }
  }

  die () {
    this.brain.die();
  }

  moveup (strength) {
    this.position[1] += strength * 0.3;
  }


  static getRandomHeritageId(){
    return String(randInt(100000,100))
  }

  get generation(){
    return this.heritageId.split('.').length;
  }
};
module.exports = Brain;
module.exports.Creature = Creature;

