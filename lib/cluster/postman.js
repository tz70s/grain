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

const Registry = require('../registry/registry');
const Activator = require('../activator/activator');
const Messenger = require('./messenger');
const { FailureManager, FailureState } = require('./failure-detector');

class Postman {

    constructor(host, registry, failureDetectorPort, neighbors) {
        this._host = host;
        this._port = this._host.split(':')[1] || 6772;
        this._registry = registry;
        this._activator = new Activator();
        this._messenger = new Messenger(this._port, this, this._registry);
        this._failureDetectorPort = failureDetectorPort;
        this._neighbors = neighbors;
        this._failureManager = new FailureManager(`${this._host.split(':')[0]}:${failureDetectorPort}`, neighbors);
    }

    forward(envelope) {
        let targetActor = this._registry.getActor(envelope.address);
        if (targetActor) {
            if (targetActor.host === this._host) {
                // Local actor
                this._activator.activate(targetActor.actor, envelope);
            } else {
                // Remote actor, forward message via messenger
                let liveHost = this._failureManager.dataHostToLiveHost(targetActor.host);
                this._failureManager.stateHandler(liveHost, (state) => {
                    switch(state) {
                        case FailureState.Alive:
                            this._messenger.actorTo(targetActor.host, envelope);
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
        } else {
            // Handling when actor is not existed.
            // TODO: Handle error if no one has the actor.
            this._messenger.addAskEvent(envelope.address, (res) => {
                this._registry.addMirrorActor(res.where, envelope.address, res.vactor);
                this._messenger.removeAskListener(envelope.address);
                this.forward(envelope);
            });
            for (let neighbor of this._neighbors) {
                let neighborDataHost = `${neighbor.host}:${neighbor.dataChannel}`;
                this._messenger.askActor(neighborDataHost, { ask: envelope.address });
            }
        }
    }
}

module.exports = Postman;