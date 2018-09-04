/*!
 * IOTA Transaction Stream
 * Copyright(c) 2017 Peter Ryszkiewicz
 * MIT Licensed
 */

const transactionWebSocketServer = require('./routes/transactionWebSocketServer')
const gephiStreamer = require('./routes/gephi-streamer')

let iotaNodeListener = null

function start({ port, iotaIP, iotaZMQPort }) {
    transactionWebSocketServer.start({ port })
    iotaNodeListener = require('./routes/iotaNodeListener')(iotaIP, iotaZMQPort)
    iotaNodeListener.setTransactionCallback(transaction => {
        transactionWebSocketServer.publishTransactionToClients(transaction)
        gephiStreamer.sendNode(transaction)
    })
}

async function stop() {
    await transactionWebSocketServer && transactionWebSocketServer.stop()
    iotaNodeListener && iotaNodeListener.stop()
}


module.exports = {
    start,
    stop
}
