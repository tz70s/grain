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
const { MessageCodec, HandShakeMessageCodec, PingMessageCodec, ActorMessageCodec } = require('./MessageCodec');
const { ClusterTracker } = require('./Cluster');
const Registry = require('../registry/Registry');
const Activator = require('../activator/Activator');
const Router = require('./Router');
const HandShaker = require('./HandShaker');

class Postman {

    constructor(port = 6772, registry, actorSystemId) {
        this._port = port;
        this._registry = registry;
        this._actorSystemId = actorSystemId;
        this._activator = new Activator();
        this._handShaker = new HandShaker();
        this._router = new Router();
        this._clusterTracker = new ClusterTracker();
        this.spwan();
    }

    spwan() {
        console.log(`Spawning a postman at 0.0.0.0:${this._port}`);
        net.createServer((socket) => {
            socket.on('data', (data) => {
                let objects = MessageCodec.marshall(data.toString());
                for (let object of objects) {
                    if (object) {
                        this._messageHandler(object, socket);
                    }
                }
            });

            socket.on('close', (data) => {
                this._router.deleteRuleFromSocket(socket);
            });

        }).listen(this._port);
    }

    async handShake(address, port) {
        const socket = await net.createConnection({ host: address, port: port }, () => {
            socket.write(new HandShakeMessageCodec(this._actorSystemId).toString());
        });

        socket.on('data', (data) => {
            let objects = MessageCodec.marshall(data.toString());
            for (let object of objects) {
                if (object) {
                    this._messageHandler(object, socket);
                }
            }
        });

        socket.on('close', (data) => {
            this._router.deleteRuleFromSocket(socket);
        });
    }

    forward(envelope) {
        let targetActor = this._registry.getActor(envelope.address);
        if (targetActor.actorSystemId === this._actorSystemId) {
            // Local actor
            this._activator.activate(targetActor.actor, envelope);
        } else {
            // Remote actor, forward message via Postman
            // Transfer actorSystemId to netAddress
            let socket = this._router.lookUpFromActorSystemId(targetActor.actorSystemId);
            if (socket) {
                this._remoteForward(socket, new ActorMessageCodec(targetActor.actorSystemId, envelope));
            } else {
                this._handShaker.startHandShake(targetActor.actorSystemId, () => {
                    let socket = this._router.lookUpFromActorSystemId(targetActor.actorSystemId);
                    if (socket) {
                        this._remoteForward(socket, new ActorMessageCodec(targetActor.actorSystemId, envelope));
                    }
                })
            }
        }
    }

    _messageHandler(object, socket) {
        switch(object.type) {
            case MessageCodec.HANDSHAKE_TYPE:
                if (this._router.lookUpFromActorSystemId(object.actorSystemId)) {
                    break;
                }
                this._router.addRoutingRule(object.actorSystemId, true, socket);
                this._handShaker.finishedHandShake(`${object.actorSystemId}`);
                socket.write(new HandShakeMessageCodec(this._actorSystemId).toString());
                break;
            case MessageCodec.PING_TYPE:
                break;
            case MessageCodec.SYNC_TYPE:
                break;
            case MessageCodec.ACTOR_TYPE:
                let id = this._router.lookUpFromSocket(socket);
                this._registry.addMirrorActor(id, object.envelope.from);
                this.forward(object.envelope);
                break;
        }
    }

    _remoteForward(socket, message) {
        if (socket) {
            socket.write(message.toString());
        }
    }
}

module.exports = Postman;