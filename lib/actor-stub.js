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

const ActorMetaDirectory = require('./actor-directory');
const ActorHosting = require('./actor-hosting');
const ActorMessagePassing = require('./actor-message-passing');
const AbstractActor = require('./actor');
const { requiredInMemory } = require('./utils/required-in-memory');

class ActorStub {
  constructor(opts, peers = []) {
    this._opts = opts;
    this._actorMetaDirectory = new ActorMetaDirectory(opts, peers);
    this._actorHosting = new ActorHosting(this._actorMetaDirectory);
    this._actorMessagePassing = new ActorMessagePassing(this._actorMetaDirectory);
  }

  async actorOf(name) {
    return await this._actorHosting.actorOf(name);
  }
}

module.exports = ActorStub;