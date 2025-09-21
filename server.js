const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Query = require('minecraft-query');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname)); // Servir index.html

const SERVER_IP = 'voxcraft.us';
const SERVER_PORT = 19132;

// Cada 5 segundos consultar el estado del server
setInterval(() => {
    const q = new Query({ host: SERVER_IP, port: SERVER_PORT, timeout: 3000 });

    q.connect().then(() => {
        q.full_stat().then(stat => {
            io.emit('serverStatus', {
                online: true,
                motd: stat.hostname,
                players: stat.players,
                onlinePlayers: stat.numplayers,
                maxPlayers: stat.maxplayers,
                version: stat.version,
                ip: `${SERVER_IP}:${SERVER_PORT}`
            });
            q.close();
        }).catch(() => io.emit('serverStatus', { online: false }));
    }).catch(() => io.emit('serverStatus', { online: false }));
}, 5000);

server.listen(3000, () => console.log('Panel en http://localhost:3000'));
