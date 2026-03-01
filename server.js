const express = require('express');
const app = express();

// Permite que o servidor leia JSON enviado pelo admin
app.use(express.json());

// Serve os arquivos da pasta public (HTML, CSS, JS)
app.use(express.static('public'));

// 🧠 MEMÓRIA DO SISTEMA
// Aqui ficam guardadas as conexões ativas e o histórico
const clients = {};       // { userId: [res1, res2, ...] }
const notifications = {}; // { userId: [{ id, message, read, time }] }

// ─────────────────────────────────────────
// ROTA SSE — o usuário "abre o canal" aqui
// ─────────────────────────────────────────
app.get('/subscribe/:userId', (req, res) => {
  const { userId } = req.params;

  // Configura os cabeçalhos para SSE funcionar
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // abre o canal imediatamente

  // Registra esse usuário na lista de conexões ativas
  if (!clients[userId]) clients[userId] = [];
  clients[userId].push(res);

  // Inicializa o histórico do usuário se não existir
  if (!notifications[userId]) notifications[userId] = [];

  // Envia o histórico imediatamente ao conectar
  const history = notifications[userId];
  res.write(`data: ${JSON.stringify({ type: 'history', notifications: history })}\n\n`);

  console.log(`✅ Usuário conectado: ${userId} | Total conexões: ${clients[userId].length}`);

  // Quando o usuário fechar a aba, remove a conexão
  req.on('close', () => {
    clients[userId] = clients[userId].filter(c => c !== res);
    console.log(`❌ Usuário desconectado: ${userId}`);
  });
});

// ─────────────────────────────────────────
// ROTA ADMIN — envia notificação
// ─────────────────────────────────────────
app.post('/notify', (req, res) => {
  const { userId, message, broadcast } = req.body;

  // Monta o objeto da notificação
  const notification = {
    id: Date.now(),       // ID único baseado no tempo
    message,
    read: false,
    time: new Date().toLocaleTimeString('pt-BR')
  };

  if (broadcast) {
    // Envia para TODOS os usuários conectados
    Object.keys(clients).forEach(uid => {
      if (!notifications[uid]) notifications[uid] = [];
      notifications[uid].push(notification);
      sendToUser(uid, notification);
    });
  } else {
    // Envia para um usuário específico
    if (!notifications[userId]) notifications[userId] = [];
    notifications[userId].push({ ...notification });
    sendToUser(userId, notification);
  }

  res.json({ success: true });
});

// ─────────────────────────────────────────
// ROTA — marcar notificação como lida
// ─────────────────────────────────────────
app.post('/read/:userId/:notifId', (req, res) => {
  const { userId, notifId } = req.params;

  if (notifications[userId]) {
    const notif = notifications[userId].find(n => n.id == notifId);
    if (notif) notif.read = true;
  }

  res.json({ success: true });
});

// ─────────────────────────────────────────
// FUNÇÃO AUXILIAR — envia evento SSE pro usuário
// ─────────────────────────────────────────
function sendToUser(userId, notification) {
  if (!clients[userId]) return;
  const data = JSON.stringify({ type: 'new', notification });
  clients[userId].forEach(clientRes => {
    clientRes.write(`data: ${data}\n\n`);
  });
}

// Sobe o servidor na porta 3000
app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});