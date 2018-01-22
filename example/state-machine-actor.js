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
const TimerActor = require('../lib/spec/timer-actor');
const Neighbor = require('../lib/cluster/neighbor');

class StateMachineActor extends AbstractActor {

    constructor() {
        super('StateMachineActor');
        this.state = {};
        this.state.number = 0;
    }

    builder() {
        return {
            _ : (self, envelope) => {
                self.state.number++;
                console.log(`Step1, state ${self.state.number}`);
                self.roll('$');
            },
            $ : (self, envelope) => {
                self.state.number += 2;
                console.log(`Step2, state ${self.state.number}`);
                self.roll();
            }
        }
    }
}

let actorSystem = new ActorSystem([new Neighbor('127.0.0.1', 6772, 11001)])
    .create(new StateMachineActor())
    .create(new TimerActor('timer0', 'StateMachineActor', 1000))
    .tell('timer0', null, { host: '127.0.0.1', port: 6772 });