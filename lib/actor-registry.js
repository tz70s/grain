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
const serialize = require('node-serialize');

class ActorMetaEntry {
    constructor(host, signature, actor) {
        this.host = host;
        this.signature = signature;
        this.actor = actor;
    }
}

class ActorRegistry {

    constructor() {
        this._entries = new Map();
    }

    createInstanceMetaEntry(host, signature, actor) {
        if (!(actor instanceof AbstractActor)) {
            throw new Error('The passing object is not an actor');
        }
        if (actor.name) {
            let name = actor.name;
            if (this._entries.has(name)) {
                if (this._entries.get(name).actor) {
                    this._entries.get(name).actor._destruct0(this._entries.get(name).actor);
                }
            }
            this._entries.set(name, new ActorMetaEntry(host, signature, actor));
        } else {
            throw new Error('The passing actor has no name attribute!');
        }
    }

    deleteMetaEntry(name) {
        // Silently do nothing if the desired to delete's actor is not existed.
        if (this._entries.get(name)) {
            this._entries.delete(name);
        }
    }

    getActorMetaEntry(name) {
        if (this._entries.get(name)) {
            return this._entries.get(name);
        } else {
            return null;
        }
    }
}

module.exports = ActorRegistry;