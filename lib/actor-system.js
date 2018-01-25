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
const ActorStub = require('./actor-stub');
const Envelope = require('./meta/envelope');
const ActorMetaDirectory = require('./actor-directory');
const ActorMessagePassing = require('./actor-message-passing');

const fs = require('fs');

class ActorSystem {

  constructor(opts, peers = []) {
    this._peers = peers;
    this._actorMetaDirectory = new ActorMetaDirectory(opts, peers);
    this._actorMessagePassing = new ActorMessagePassing(this._actorMetaDirectory);
  }

  /**
   * Specify a module path from the root path.
   * We'll scan the path and transfer code into distributed hash ring to be ready on instantiate.
   * @param {string} name
   * @param {string} modulePath, absolute path of required module, currently. 
   * @param {*} version
   */
  actorOf(name, modulePath, version) {
    return new Promise((resolve, reject) => {
      fs.readFile(modulePath, 'utf8', (err, contents) => {
        if (err) { reject(`Can't find module ${err}`); }
        this._actorMetaDirectory.setActorMeta(name, contents, -1, version);
        resolve(name);
      });
    })
  }

  tell(name, content) {
    let envelope = new Envelope('root', name, content);
    this._actorMessagePassing.mailTo(name);
    // TODO: Call out common core functionalities in forward steps.
    return this;
  }
}

module.exports = ActorSystem;