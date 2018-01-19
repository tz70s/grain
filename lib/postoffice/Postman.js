/*
 * Copyright (c) 2018 Dependable Network and System Lab, National Taiwan University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const net = require('net');
const { MessageCodec } = require('./MessageCodec');
const { ClusterTracker } = require('./Cluster');

class Postman {

    constructor(port = 6772) {
        this._port = port;
        this.clients = new Map();
        this._clusterTracker = new ClusterTracker();
        this.spwan();
    }

    spwan() {
        console.log(`Spawning a postman at 0.0.0.0:${this._port}`);

        net.createServer((socket) => {

            this.clients.set({ address: socket.remoteAddress, port: socket.remotePort} , socket);

            socket.on('data', (data) => {
                // Receiving data.
                console.log(`Receiving data from ${socket.remoteAddress}:${socket.remotePort}`);
                console.log(`Data : ${data}`);
                let object = MessageCodec.marshall(data);
            });

            socket.on('close', (data) => {
                // Handling when the socket is closed.
                console.log(`Connection closed from ${socket.remoteAddress}:${socket.remotePort}`);
            });

        }).listen(this._port);
    }

    async forward(netAddress, message) {
        // Find out if socket is existed.
        if (this.clients.get(netAddress)) {
            const socket = this.clients.get(netAddress);
            await socket.write(JSON.stringify(message));
        } else {
            // Established connections
            const socket = await net.createConnection({ port: netAddress.port }, () => {
                this.clients.set(netAddress, socket);
                socket.write(JSON.stringify(message));
            });

            socket.on('data', (data) => {
               // Receiving data.
               console.log(`Receiving data from ${socket.remoteAddress}:${socket.remotePort}`);
               console.log(`Data : ${data}`);
               MessageCodec.marshall(data); 
            });

            socket.on('end', (data) => {
                // Handling when the socket is closed.
                console.log(`Connection closed from ${socket.remoteAddress}:${socket.remotePort}`);
            });
        }
    }
}

module.exports = Postman;