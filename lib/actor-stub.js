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

const AbstractActor = require('./actor');
const ActorRegistry = require('./actor-registry');
const ActorHosting = require('./actor-hosting');
const RpcServer = require('./remote/rpc-server');

class ActorStub {
    constructor(opts, neighbor = []) {
        this._opts = opts;
        console.log(`Spawn a new actor stub at ${opts.host}:${opts.port}`);
        this._actorRegistry = new ActorRegistry();
        this._actorHosting = new ActorHosting(opts.host, opts.port, opts.failureDetectorPort, 
            neighbor, this._actorRegistry);
        this._rpcServer = new RpcServer(opts.port, this);
    }

    createMirrorSignature(signature) {

    }

    create(signature) {
        let stateInstance = eval(`(${signature})`);
        stateInstance._context = this;
        let actorInstance = Object.assign(new AbstractActor("tmp"), stateInstance);
        this._actorRegistry.createInstanceMetaEntry(`${this._opts.host}:${this._opts.port}`, signature, actorInstance);
        return this;
    }

    forward(envelope) {
        this._actorHosting.forward(envelope);
    }
}

module.exports = ActorStub;