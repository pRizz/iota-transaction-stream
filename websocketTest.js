// Can be copy pasted into Chrome console after starting server

let ws = new WebSocket('ws://localhost:8008')
ws.addEventListener('message', message => {console.log('message', message)})
ws.addEventListener('error', message => {console.error('error', message)})
ws.addEventListener('open', message => {console.log('open', message)})
