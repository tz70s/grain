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

const ActorSystem = require('./actor-system');
const Envelope = require('./envelope');
const assert = require('assert');

class AbstractActor {

    constructor(name) {
        this._context = null;
        assert(name, 'Name should be set.');
        this._name = name;
        this._recvFn = this.receive;
        this._previousRecvFn = this._recvFn;
    }

    receive(envelope) {

    }
    
    recvFn0(envelope) {
        return this._recvFn(envelope);
    }

    roll(recvFn) {
        this._previousRecvFn = this._recvFn;
        this._recvFn = recvFn;
    }

    rollBack() {
        let tmp = this._previousRecvFn;
        this._previousRecvFn = this._recvFn;
        this._recvFn = tmp;
    }

    tell(address, content) {
        let envelope = new Envelope(this._name, address, content);
        this._context._forward(envelope);
    } 

    ask(address, content) {
        let envelope = new Envelope(this._name, address, content, true);
        this._context._forward(envelope);
    }

    get context() {
        return this._context;
    }

    set context(actorSystem) {
        if (actorSystem.prototype === ActorSystem.prototype) {
            this._context = actorSystem;
        } else {
            throw new Error("Can't set non-actor-system as context for an actor");
        }
    }

    get name() {
        return this._name;
    }
}

module.exports = AbstractActor;