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
const { path } = require('./rpc-path');

class RpcStub {

    constructor() {
        this._creationEvent = new EventEmitter();
    }

    actor(address, message) {
        let req = coap.request(`coap://${address}/${path.actor}`);
        req.write(JSON.stringify(message));
        req.end();
    }

    signature(address, name, signature) {
        let req = coap.request(`coap://${address}/${path.signature}`);
        req.write(JSON.stringify( { signature: signature }));
        req.on('response', (res) => {
            this._creationEvent.emit(`${address}-${name}-create`);
        });
        req.end();
    }

    afterCreation(address, name, callback) {
        this._creationEvent.once(`${address}-${name}-create`, () => {
            callback();
            this._creationEvent.removeListener(`${address}-${name}-create`, () => {});
        });
    }
}

module.exports = RpcStub;