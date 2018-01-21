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

const coap = require('coap');
const EventEmitter = require('events').EventEmitter;

const URIPath = {
    actor: 'actor',
    ask: 'ask',
    create: 'create'
}

class Messenger {

    constructor(port = 6772, postman, registry) {
        this._port = port;
        this._server = coap.createServer();
        this._postman = postman;
        this._registry = registry;
        this._askEventBroker = new EventEmitter();
        this._spawn();
    }

    addAskEvent(who, callback) {
        this._askEventBroker.once(who, callback);        
    }

    removeAskListener(who) {
        this._askEventBroker.removeListener(who, () => {});
    }

    actorTo(address, message) {
        let req = coap.request(`coap://${address}/${URIPath.actor}`);
        req.write(JSON.stringify(message));
        req.on('response', (res) => {});
        req.end();
    }

    askActor(address, message, callback) {
        let req = coap.request(`coap://${address}/${URIPath.ask}`);
        req.write(JSON.stringify(message));
        req.on('response', (res) => {
            try {
                let resObj = JSON.parse(res.payload.toString());
                if (resObj.where) {
                    this._askEventBroker.emit(message.ask, resObj);
                }
            } catch (err) {}
        });
        req.end();
    }

    _spawn() {
        this._server.listen(this._port, () => {
        });

        this._server.on('request', (req, res) => {
            switch (req.url.split('/')[1]) {
                case URIPath.actor:
                    this._actorHandler(req.payload.toString());
                    break;
                case URIPath.ask:
                    let meta = this._askHandler(req.payload.toString());
                    if (meta) {
                        res.end(JSON.stringify({ where: meta.host,  vactor: meta.vactor }));
                    }
                    break;
                default:
                    break;
            }
            res.end();
        });
    }

    _actorHandler(raw) {
        let envelope = null;
        try {
            envelope = JSON.parse(raw);
        } catch (err) {}
        if (!(!!envelope.from && !!envelope.address)) envelope = null;
        this._postman.forward(envelope);
    }

    _askHandler(raw) {
        try {
            let message = JSON.parse(raw);
            if (message.ask) {
                let meta = this._registry.getActor(message.ask);
                if (meta) return meta;
            }
        } catch (err) {}
        return null;
    }
}

module.exports = Messenger;