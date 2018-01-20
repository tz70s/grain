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

const Activator = require('./activator/Activator');
const AbstractActor = require('./Actor');
const Registry = require('./registry/Registry');
const Envelope = require('./Envelope');
const Postman = require('./postoffice/Postman');
const uuidv1 = require('uuid/v1');

class ActorSystem {

    constructor(actorSystemId, port = 6772) {
        this._actorSystemId = actorSystemId || uuidv1();
        console.log(`Spawn a new actor system ${this._actorSystemId}`);
        this._port = port;
        this._registry = new Registry();
        this._postman = new Postman(port, this._registry, this._actorSystemId);
    }

    create(actor) {
        // TODO: More type safe check actor.
        if (actor instanceof AbstractActor) {
            actor.context = this;
            this._registry.addActor(this._actorSystemId, actor);
        }
        return this;
    }

    tell(name, content) {
        let envelope = new Envelope(name, content);
        envelope.guarantee = false;
        envelope.from = 'root';
        this._forward(envelope);
        return this;
    }

    ask(name, content) {
        let envelope = new Envelope(name, content);
        envelope.guarantee = true;
        envelope.from = 'root';
        this._forward(envelope);
        return this;
    }

    _forward(envelope) {
        this._postman.forward(envelope);
    }
}

module.exports = ActorSystem;