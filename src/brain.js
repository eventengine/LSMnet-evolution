const range = require('lodash/range');
const mean = require('lodash/mean');
const sum = require('lodash/sum');
const random = require('lodash/random');

const activation = require('sigmoid');
import { extendObservable } from 'mobx';

import { rand0to1_F, toss, randMin1to1_F } from './utils'

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

class Neuron extends Organ {
  constructor ({ base, name, threshold, leaking, cb }) {
    super();

    this.name = 'Neuron_' + name;

    this.base = base;
    this.connections = [];
    this.payloads = [];
    this.threshold = threshold;
    this.leaking = leaking;
    this.cb = cb;

    extendObservable(this, { state: base, power: Neuron.minPower * 2 });

  }

  static minPower = 0.1;

  charge (payload) {
    if(this.isDead){return;}

    this.power = Math.max((this.power + payload), 0);
    if (this.power > this.threshold) {
      setTimeout(() => {
        this.fire()
      }, 10);
      this.power = Neuron.minPower;

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
      this.cb();
    }

  }
  die(){
    super.die();
    this.power = 0;
  }

  createConnection (dest, strength) {
    // //check if not already connection
    // if (
    //   toss(0.9)
    //   ||
    //   dest.connections.some(c => c.dest === this)
    // ) {
    //   // return;
    // }
    this.connections.push({ dest, strength })
  }
}


const numOfNeurons = 30;


export default class Brain extends Organ {
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
    console.log(
      'pulse', this.age
      // evaluate(this.neurons)
    );
    this.age++;
    if (this.age === 100) {
      this.die();
    }
  }
}


export class Creature extends Organ {
  constructor ({ name, inputs, outputs, startPosition }) {
    super();
    this.name = 'Creature_';


    extendObservable(this, {
      position: startPosition
    });

    this.timeInputNeuron = new Neuron({
      name: name + '_timeInput',
      base: rand0to1_F(),
      leaking: random(0.001, 0.2),
      threshold: random(0.3, 1.5),
    });

    const movementNeuron = new Neuron({
      name: name + '_movementNeuron',
      base: rand0to1_F(),
      leaking: random(0.001, 0.2),
      threshold: random(0.3, 1.5),
      cb: this.moveup.bind(this)
    });

    this.brain = new Brain(name, [movementNeuron, this.timeInputNeuron]);

  }

  updateTime (frame) {
    if(this.isDead) {return;}
    this.timeInputNeuron.charge(0.8);
    if(frame % 100 === 0){
      // console.log('frame');
    }
    if(frame === 1000){ this.brain.die(); }
  }

  moveup () {
    this.position[1] += 0.1;
  }
}
