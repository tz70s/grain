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

const { ActorMetaInterface } = require('./actor-meta');
const ActorHosting = require('./actor-hosting');
const AbstractActor = require('./actor');
const { requiredInMemory } = require('./utils/required-in-memory');

class ActorStub {
  constructor(opts, peers = []) {
    this._opts = opts;
    this._actorMetaInterface = new ActorMetaInterface(opts, peers);
    console.log(`Spawn a new actor stub at `);
  }

  async actorOf(name) {
    try {
      let meta = await this._actorMetaInterface.getActorMeta(name);
      let constructor = requiredInMemory(meta.code);
      return constructor;
    } catch (err) {
      return err;
    }
  }
}

module.exports = ActorStub;