const random = require('lodash/random');


export function rand0to1_F () {
  return random(0, 1, true)
}
export function toss(rate = 0.5){
  return rand0to1_F() > rate;

}
export function randMin1to1_F () {
  return random(-1, 1, true)
}
// function rand0toX_Int (x) {
//   return random(0, x, true)
// }
// function rand0toX_Int_exceptY (x, exceptY) {
//   const r = random(0, x - 1)
//   return r < exceptY ? r : r + 1
// }