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

const Activator = require('./activator/activator');
const AbstractActor = require('./actor');
const Registry = require('./registry/registry');
const Envelope = require('./envelope');
const Postman = require('./cluster/postman');

class ActorSystem {

    constructor(host, failureDetectorPort = 11000, neighbor = []) {
        this._host = host;
        console.log(`Spawn a new actor system at ${this._host}`);
        this._failureDetectorPort = failureDetectorPort;
        this._neighbor = neighbor;
        this._registry = new Registry();
        this._postman = new Postman(this._host, this._registry, this._failureDetectorPort, this._neighbor);
    }

    create(actor) {
        if (actor instanceof AbstractActor) {
            actor.context = this;
            this._registry.addActor(this._host, actor);
        }
        return this;
    }

    tell(name, content) {
        let envelope = new Envelope('root', name, content);
        this._forward(envelope);
        return this;
    }

    ask(name, content) {
        let envelope = new Envelope('root', name, content, true);
        this._forward(envelope);
        return this;
    }

    _forward(envelope) {
        this._postman.forward(envelope);
    }
}

module.exports = ActorSystem;