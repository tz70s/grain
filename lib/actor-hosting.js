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

class ActorHosting {
  constructor() {
    this._activator = new Activator();
  }

  forward(envelope) {

  }

  _localForward(actorMetaEntry, envelope) {
    if (actorMetaEntry.actor) {
      this._activator.activate(actorMetaEntry.actor, envelope);
    } else {
      // Instantiate actor if it is not existed.
      // FIXME: Migrate to code execution
      let stateInstance = eval(`(${actorMetaEntry.signature})`);
      stateInstance._context = this;
      let actorInstance = Object.assign(new AbstractActor("_"), stateInstance);
      this._actorRegistry.createActorMetaEntry(actorInstance.name, 
        actorMetaEntry.host, 
        actorMetaEntry.signature, 
        actorInstance);
      this._activator.activate(actorInstance, envelope);
    }
  }

  _remoteForward(actorMetaEntry, envelope) {

  }
}