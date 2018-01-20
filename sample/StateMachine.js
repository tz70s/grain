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

const ActorSystem = require('../lib/ActorSystem');
const AbstractActor = require('../lib/Actor');

class StateMachineActor extends AbstractActor {
    constructor() {
        super('StateMachineActor');
        this.state = {};
        this.state.number = 0;
    }

    receive(envelope) {
        console.log(envelope.content);
        console.log(++this.state.number);
        this.roll(this.anotherReceive);
    }

    anotherReceive(envelope) {
        console.log(`Another receive! ${envelope.content}`);
        this.state.number += 2;
        console.log(this.state.number);
        this.rollBack();
    }
}

let actorSystem = new ActorSystem();
actorSystem.create(new StateMachineActor())
    .tell('StateMachineActor', 'Hi state machine!')
    .tell('StateMachineActor', 'Hello state machine, another call!')
    .tell('StateMachineActor', 'Hi state machine, third call!');