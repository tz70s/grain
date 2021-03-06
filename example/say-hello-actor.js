/*
 * Copyright (c) 2018 Tzu-Chiao Yeh.
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

const AbstractActor = require('../lib/actor');

class SayHelloActor extends AbstractActor {

    constructor() {
        super('say-hello-actor0');
        this.state = {};
        this.state.number = 0;
    }

    receive(envelope) {
        console.log(envelope.content);
        console.log(this.state.number++);
        this.tell('debugger0', 'Hi, Debugger!');
    }
}

module.exports = SayHelloActor;