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

const Activator = require('./activator');
const AbstractActor = require('./actor');
const ActorStub = require('./actor-stub');
const serialize = require('serialize-javascript');
const Envelope = require('./envelope');
const RpcStub = require('./remote/rpc-stub');

class ActorSystem {

    constructor(neighbors = []) {
        this._rpc = new RpcStub();
        this._neighbors = neighbors;
    }

    create(actor) {
        if (actor instanceof AbstractActor) {
            actor._receiver = actor.builder();
            actor._recv0 = actor._receiver._;
            actor._destruct0 = actor.destruct();
            let signature = serialize(actor);
            for (let neighbor of this._neighbors) {
                // FIXME: Currently, send signatures to all neighbors.
                this._rpc.signature(`${neighbor.host}:${neighbor.port}`, actor.name, signature);
            }
        }
        return this;
    }

    tell(name, content, neighbor) {
        let envelope = new Envelope('root', name, content);
        if (neighbor) {
            this._rpc.actor(`${neighbor.host}:${neighbor.port}`, envelope);
        }
        return this;
    }
}

module.exports = ActorSystem;