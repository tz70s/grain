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

const Registry = require('../registry/Registry');
const Postman = require('../postoffice/Postman');
const { ActorMessageCodec } = require('../postoffice/MessageCodec');

/**
 * The Activator is responsible for register, fire events as a main guard on a single machine.
 */
class Activator {

    constructor(registry, port = 6772) {
        this._registry = registry;
        this._postMan = new Postman(port);
        this._port = port;
    }

    tell(envelope) {
        envelope.guarantee = false;
        // Find out registry
        let targetActor = this._registry.getActor(envelope.address);
        if ((targetActor.netAddress.address === 'localhost') && (targetActor.netAddress.port === this._port)) {
            // Local actor
            targetActor.actor.recvFn0(envelope.content);
        } else {
            // Remote actor, forward message via Postman
            this._postMan.forward(targetActor.netAddress, new ActorMessageCodec(envelope));
        }
    }

    ask(envelope) {
        envelope.guarantee = true;
        // Find out registry
        let targetActor = this._registry.getActor(envelope.address);
        if ((targetActor.netAddress.address === 'localhost') && (targetActor.netAddress.port === this._port)) {
            // Local actor
            targetActor.actor.recvFn0(envelope.content);
        } else {
            // Remote actor
            this._postMan.forward(targetActor.netAddress, new ActorMessageCodec(envelope));
        }
    }
}

module.exports = Activator;