const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let messages = [];
const MAX_MESSAGES = 100;

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
    console.log('有人连进来了');

    ws.send(JSON.stringify({
        type: 'history',
        messages: messages
    }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.type === 'chat') {
                const chatMsg = {
                    name: msg.name,
                    text: msg.text,
                    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                };
                messages.push(chatMsg);
                if (messages.length > MAX_MESSAGES) {
                    messages.shift();
                }
                const broadcast = JSON.stringify({ type: 'chat', message: chatMsg });
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcast);
                    }
                });
            }
        } catch (e) {
            console.log('消息格式错误', e);
        }
    });

    ws.on('close', () => {
        console.log('有人离开了');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('nC Chat 跑在端口 ' + PORT);
});
