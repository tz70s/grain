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
const { path } = require('./remote-path');

class RPCServer {

    constructor(port = 6772, actorStub) {
        this._port = port;
        this._actorStub = actorStub;
        this._server = coap.createServer();
        this._spawn();
    }

    _spawn() {
        this._server.listen(this._port, () => {});
        this._server.on('request', (req, res) => {
            let _path = req.url.split('/')[1];
            switch (_path) {
                case path.actor:
                    this._actor0(req.payload.toString());
                    break;
                case path.signature:
                    this._signature0(req.payload.toString());
                    break;
                default:
                    break;
            }
            res.end();
        });
    }

    _actor0(raw) {
        let envelope = null;
        try {
            envelope = JSON.parse(raw);
        } catch (err) {}
        if (!(!!envelope.from && !!envelope.address)) envelope = null;
        this._actorStub.forward(envelope);
    }

    _signature0(raw) {
        let signature = null;
        try {
            let obj = JSON.parse(raw);
            signature = obj.signature;
        } catch (err) {}
        this._actorStub.create(signature);
    }
}

module.exports = RPCServer;