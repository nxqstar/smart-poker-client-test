const WebSocket = require('ws');
const url = 'ws://127.0.0.1:6666';
const ws = new WebSocket(url);
const eccrypto = require('eccrypto');
const privateKey = eccrypto.generatePrivate();
const publicKey = eccrypto.getPublic(privateKey);
let serverPublicKey;

sendToServer = (obj) => {
    ws.send(JSON.stringify(obj));
};

testRequest = () => {
    const obj = {
        cmd: 2,
        data: {}
    };
    sendToServer(obj);
};

login = async () => {
    // const data = {
    //     coin: 5000,
    //     user: {
    //         name: 'quideptrai',
    //     },
    //     history: [
    //         { id: 1, bet: 2, win: 3 },
    //         { id: 4, bet: 5, win: 6 },
    //     ],
    //     array: [1,2,3],
    //     money: 60.35
    // };
    // const gameEvent = 0;
    // const msg = binaryBuilder.buildPacket(gameEvent, data, BinaryStruct.loginStruct);
    // ws.send(msg);
    const params = {
        token: 'tokenHere',
        publicKey,
    };
    sendToServer({ cmd: 1, params });
};

parseRequest = (msg) => {
    // const {gameEvent, body} = binaryParser.parsePacket(msg);
    // const struct = BinaryStruct.loginStruct;
    // const {obj} = binaryParser.parseData(body, struct);
    // console.log('obj', obj);
};

onLoggedIn = async (params) => {
    const { data } = params;
    // var serverPublicKey = Buffer.from(JSON.stringify(buffer));
    serverPublicKey = Buffer.from(data.publicKey);

    const testData = {
        name: 'quideptrai',
        gold: 1234576,
    };
    console.log('serverPublicKey', serverPublicKey, serverPublicKey.length);
    // const msg = await eccrypto.encrypt(serverPublicKey, Buffer.from(JSON.stringify(testData)));
    const msg = await eccrypto.encrypt(serverPublicKey, Buffer.from('abc'));
    // const msg = eccrypto.encrypt(serverPublicKey, Buffer.from(testData));
    console.log('msg', msg);
    sendToServer({ cmd: 0, params: { msg } });
};

ws.on('open', function () {
    login();
});
ws.on('message', function (msg, flags) {
    const str = msg.toString();
    const parse = JSON.parse(str);
    const { cmd, params } = parse;
    if (cmd === 1) {
        onLoggedIn(params);
    } else if(cmd === 0){
        console.log('test', params);
    } else {
        console.log('cmd', cmd);
        console.log('params', params);
    }
});

const ecdsa = require('ecdsa');