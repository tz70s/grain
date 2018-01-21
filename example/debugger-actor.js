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

const ActorSystem = require('../lib/actor-system');
const AbstractActor = require('../lib/actor');
const Neighbor = require('../lib/neighbor');

class DebuggerActor extends AbstractActor {
    constructor(name) {
        super('debugger0');
    }
    receive(envelope) {
        console.log(envelope.content);
    }
}

let neighbors = [new Neighbor('127.0.0.1', 6772, 11000)];
let actorSystem = new ActorSystem('127.0.0.1:6773', 11001, neighbors);
actorSystem.create(new DebuggerActor());