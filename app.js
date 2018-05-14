/*!
 * IOTA Transaction Stream
 * Copyright(c) 2017 Peter Ryszkiewicz
 * MIT Licensed
 */

const argv = require('minimist')(process.argv.slice(2), {
  'alias': {
    'h': 'help',
    'i': 'iotaIP',
    'p': 'iotaZMQPort',
    'w': 'webSocketServerPort'
  },
  'default': {
    'iotaZMQPort': 5556,
    'webSocketServerPort': 8008
  }
})

function printHelp() {
  console.log(`iota-transaction-stream
  A microservice that transmits new transactions from an IOTA node to any number of listeners, in real-time, through WebSockets
  Usage: iota-transaction-stream --iotaIP=ip [--iotaZMQPort=port] [--webSocketServerPort=port] [--help]
    options:
      -i, --iotaIP ip : the IP address of the IOTA node
      -p, --iotaZMQPort port: the port of the ZMQ on the IOTA node; defaults to 5556
      -w, --webSocketServerPort port: the port of the WebSocket server which relays new IOTA transactions; defaults to 8008
      -h, --help : print this help info
  
  Example usage: iota-transaction-stream --iotaIP 123.45.67.890 --iotaZMQPort 5556 --webSocketServerPort 8008
  Example if running from an IDE: npm run start -- --iotaIP 123.45.67.890 --iotaZMQPort 5556 webSocketServerPort 8008
    `)
  process.exit(0)
}

if(argv.help) {
  printHelp()
}

if(!argv.iotaIP) {
  console.error(`You must supply an ip address to --iotaIP`)
  printHelp()
}

const transactionWebSocketServer = require('./routes/transactionWebSocketServer')(argv.webSocketServerPort)
const iotaNodeListener = require('./routes/iotaNodeListener')(argv.iotaIP, argv.iotaZMQPort)
iotaNodeListener.setTransactionCallback(transaction => {
    transactionWebSocketServer.publishTransactionToClients(transaction)
})

module.exports = {}
