const random = require('lodash/random');


function rand0to1_F () {
  return random(0, 1, true)
}
function toss(rate = 0.5){
  return rand0to1_F() < rate;

}
function randMin1to1_F () {
  return random(-1, 1, true)
}

function rangeNum(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function randInt (to, from = 0) {
  return random(from, to, false)
}

module.exports = {
  rand0to1_F,
  toss,
  randMin1to1_F,
  rangeNum,
  randInt
};
