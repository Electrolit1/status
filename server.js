// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const readline = require('readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname)); // Servir index.html

const logPath = './logs/latest.log'; // Ruta del log de Minecraft

// Leer log en tiempo real
const stream = readline.createInterface({
    input: fs.createReadStream(logPath, { encoding: 'utf8' }),
    terminal: false
});

stream.on('line', (line) => {
    io.emit('newLog', line); // Enviar línea al frontend
});

// Socket.IO conexión
io.on('connection', (socket) => {
    console.log('Usuario conectado');
});

server.listen(3000, () => console.log('Web lista en http://localhost:3000'));
