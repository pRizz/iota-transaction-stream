/*!
 * IOTA Transaction Stream
 * Copyright(c) 2017 Peter Ryszkiewicz
 * MIT Licensed
 */

const zmq = require('zeromq')
const iotaLib = require('iota.lib.js')
const iota = new iotaLib({})


let txCount = 0
let tpsInterval = 30 // seconds

setInterval(() => {
    console.log(`${new Date().toISOString()}: TPS: ${txCount / tpsInterval}`)
    txCount = 0
}, tpsInterval * 1000)

let transactionCallback = () => {}

function setTransactionCallback(callback) {
    transactionCallback = callback
}

let iotaSocket
let zmqSource

function start() {
    console.log(`${new Date().toISOString()}: Connecting to ZMQ, ${zmqSource}`)

    if(iotaSocket) { stop() }

    iotaSocket = zmq.socket('sub')
    iotaSocket.connect(zmqSource)
    iotaSocket.subscribe('tx_trytes')

    iotaSocket.on('message', (topic, message) => {
        console.log(`${new Date().toISOString()}: Got message`)
        if(!topic) {
            return console.error(`${new Date().toISOString()}: Received message with no topic: ${topic}`)
        }

        const topicAsString = Buffer.from(topic).toString()

        console.log(`${new Date().toISOString()}: Got message: ${topicAsString.substring(0, 20)}`)

        const [_topic, trytes] = topicAsString.split(' ')
        const txObject = iota.utils.transactionObject(trytes)
        console.log(`${new Date().toISOString()}: got tx object from node`)
        ++txCount

        transactionCallback(txObject)
    })

    iotaSocket.on('error', (error) => {
        console.log(`${new Date().toISOString()}: An error occurred, ${error}`)
        console.log(`${new Date().toISOString()}: An error occurred, `, error)
    })

    iotaSocket.monitor(2000, 0)

// For debugging purposes
    iotaSocket.on('connect', () => { console.log(`${new Date().toISOString()}: Socket event connect emitted`) })
    iotaSocket.on('connect_delay', () => { console.log(`${new Date().toISOString()}: Socket event connect_delay emitted`) })
    iotaSocket.on('connect_retry', () => { console.log(`${new Date().toISOString()}: Socket event connect_retry emitted`) })
    iotaSocket.on('listen', () => { console.log(`${new Date().toISOString()}: Socket event listen emitted`) })
    iotaSocket.on('bind_error', () => { console.log(`${new Date().toISOString()}: Socket event bind_error emitted`) })
    iotaSocket.on('accept', () => { console.log(`${new Date().toISOString()}: Socket event accept emitted`) })
    iotaSocket.on('accept_error', () => { console.log(`${new Date().toISOString()}: Socket event accept_error emitted`) })
    iotaSocket.on('close', () => { console.log(`${new Date().toISOString()}: Socket event close emitted`) })
    iotaSocket.on('close_error', () => { console.log(`${new Date().toISOString()}: Socket event close_error emitted`) })
    iotaSocket.on('disconnect', () => { console.log(`${new Date().toISOString()}: Socket event disconnect emitted`) })

}

function stop() {
    console.log(`${new Date().toISOString()}: disconnecting from IOTA ZMQ`)
    if(!iotaSocket) { return }
    iotaSocket.disconnect(zmqSource)
    iotaSocket = null
}

function restart() {
    console.log(`${new Date().toISOString()}: restarting IOTA ZMQ connection`)
    stop()
    start()
}

const reconnectInterval = 3 * 60 * 60 * 1000 // hours

// Workaround for bug with no new messages showing up after a few hours
setInterval(() => {
    restart()
}, reconnectInterval)

module.exports = function(zmqIP, zmqPort = 5556) {
    if(!zmqIP) {
        throw `Missing IP`
    }

    zmqSource = `tcp://${zmqIP}:${zmqPort}`
    start()

    return {
        setTransactionCallback,
        stop
    }
}
