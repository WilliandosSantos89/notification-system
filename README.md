# 🔔 Sistema de Notificações em Tempo Real

Um sistema de notificações em tempo real inspirado no "sininho" do YouTube, desenvolvido do zero com Node.js e Server-Sent Events (SSE).

## ✨ Funcionalidades

- Notificações em tempo real sem refresh na página
- Painel admin para envio individual ou broadcast
- Contador de notificações não lidas
- Marcar notificação como lida com um clique
- Histórico de notificações ao reconectar
- Som de alerta ao receber notificação
- Notificação nativa do navegador
- Suporte a múltiplos usuários simultâneos

## 🛠️ Tecnologias

- **Node.js** — ambiente de execução JavaScript no servidor
- **Express** — framework para criação das rotas e servidor HTTP
- **SSE (Server-Sent Events)** — protocolo nativo para streaming de dados do servidor ao cliente
- **HTML, CSS e JavaScript puro** — frontend sem frameworks

## 🧠 Como funciona

O sistema usa **Server-Sent Events (SSE)** para manter um canal aberto entre o servidor e o navegador. Quando o admin envia uma notificação, o servidor empurra os dados para todos os clientes conectados instantaneamente — sem polling, sem WebSocket, sem biblioteca externa.