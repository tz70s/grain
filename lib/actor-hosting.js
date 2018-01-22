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
const { FailureManager, FailureState } = require('./cluster/failure-detector');
const RPCStub = require('./remote/rpc-stub');

class ActorHosting {

    constructor(host, port, failureDetectorPort, neighbors, actorRegistry) {
        this._host = host;
        this._port = port;
        this._failureDetectorPort = failureDetectorPort;
        this._neighbors = neighbors;
        this._actorRegistry = actorRegistry;
        this._activator = new Activator();
        this._rpc = new RPCStub();
        this._failureManager = new FailureManager(`${this._host}:${failureDetectorPort}`, neighbors);
    }

    forward(envelope) {
        let actorMetaEntry = this._actorRegistry.getActorMetaEntry(envelope.address);
        if (actorMetaEntry) {
            if (actorMetaEntry.host === `${this._host}:${this._port}`) {
                this._localActivate(actorMetaEntry.actor, envelope);
            } else {
                this._remoteActivate(actorMetaEntry.host, envelope);
            }
        } else {
            this._retrieveActor(envelope);
        }
    }

    _localActivate(actor, envelope) {
        this._activator.activate(actor, envelope);
    }

    _remoteActivate(host, envelope) {
        let liveHost = this._failureManager.dataHostToLiveHost(host);
        this._failureManager.stateHandler(liveHost, (state) => {
            switch(state) {
                case FailureState.Alive:
                    this._rpc.actor(host, envelope);
                    this._failureManager.removeHandler(liveHost);
                    break;
                case FailureState.Suspect:
                    // Wait for next state, either alive or fault.
                    break;
                case FailureState.Fault:
                    // Create a new instance.
                    console.log('Destination is faulty');
                    break;
                default:
                    console.log('No state found');
                    break;
            }
        });
    }

    _retrieveActor(envelope) {
        // Handling when actor is not existed.
    }
}

module.exports = ActorHosting;