
const request = require('request')

let x = 20
let y = 20
const baseURL = `http://localhost:8080/workspace1?operation=updateGraph`

// TODO: implement
function xForTx(tx) {
  x += Math.random() * 15
  return x
}

// TODO: implement
function yForTx(tx) {
  y += Math.random() * 24
  return y
}

function sendNode(tx) {
  const x = xForTx(tx)
  const y = yForTx(tx)
  let nodeName = `${x},${y}`
  let an = {} // addNode
  an[nodeName] = {
    "r": 0.6,
    "g": 0.6,
    "b": 0.6,
    "size": 10,
    x,
    y,
    "z": 0
  }
  request(baseURL, {
    body: { an },
    json: true

  }, (error, iM, res) => {
    console.log(`error, `, error)
    console.log(`im, `, iM)
    console.log(`res, `, res)
  })

}

module.exports = {
  sendNode
}