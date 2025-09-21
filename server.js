const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const util = require("minecraft-server-util");
const { Rcon } = require("rcon-client");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname)); // Para servir index.html

// ⚙️ Configura tu server
const SERVER_IP = "51.161.118.214";
const SERVER_PORT = 20237;
const RCON_PORT = 25575; // cámbialo si es diferente
const RCON_PASSWORD = "TuClaveSegura"; // cámbialo por tu clave

// Estado del servidor cada 5s
setInterval(async () => {
  try {
    const status = await util.status(SERVER_IP, SERVER_PORT);
    io.emit("serverStatus", {
      online: true,
      motd: status.motd.clean,
      players: status.players.sample || [],
      onlinePlayers: status.players.online,
      maxPlayers: status.players.max,
      version: status.version.name,
    });
  } catch (err) {
    io.emit("serverStatus", { online: false });
  }
}, 5000);

// Manejo de RCON
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("sendCommand", async (cmd) => {
    try {
      const rcon = await Rcon.connect({
        host: SERVER_IP,
        port: RCON_PORT,
        password: RCON_PASSWORD,
      });

      const res = await rcon.send(cmd);
      socket.emit("commandResponse", res);

      await rcon.end();
    } catch (err) {
      socket.emit("commandResponse", "❌ Error al ejecutar comando");
    }
  });
});

server.listen(3000, () =>
  console.log("Panel abierto en http://localhost:3000")
);
