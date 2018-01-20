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

const AbstractActor = require('../Actor');

class Registry {

    constructor() {
        /** 
         * type Map<string, Array<{
         * actorSystemId : string,
         * vactor : actor.prototype,
         * actor : instance
         * }>> 
         */
        this._localRegistry = new Map();
    }

    addMirrorActor(actorSystemId, name) {
        if (this._localRegistry.has(name)) {
            for (let meta of this._localRegistry.get(name)) {
                if (meta.actorSystemId === actorSystemId) return;
            }
            this._localRegistry.get(name).push({ actorSystemId: actorSystemId, _vactor: null, actor: null });
        } else {
            this._localRegistry.set(name, [ { actorSystemId: actorSystemId, vactor: null, actor: null } ])
        }
    }

    addActor(actorSystemId, actor) {
        if (!(actor instanceof AbstractActor)) {
            throw new Error('The passing object is not an actor');
        }
        if (actor.name) {
            let name = actor.name;
            if (this._localRegistry.get(name)) {
                this._localRegistry.get(name).push({ actorSystemId: actorSystemId, 
                    vactor: Object.getPrototypeOf(actor), 
                    actor: actor });
            } else {
                this._localRegistry.set(name, [{ actorSystemId: actorSystemId, 
                    vactor: Object.getPrototypeOf(actor), 
                    actor: actor }])
            }
        } else {
            throw new Error('The passing actor has no name attribute!');
        }
    }

    deleteActor(name) {
        // Silently do nothing if the desired to delete's actor is not existed.
        if (this._localRegistry.get(name)) {
            this._localRegistry.delete(name);
        }
    }

    getActor(name) {
        if (this._localRegistry.get(name)) {
            return this._localRegistry.get(name)[0];
        } else {
            throw new Error("Doesnt existed such actor.");
        }
    }
}

module.exports = Registry;