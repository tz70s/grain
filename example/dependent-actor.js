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
const Neighbor = require('../lib/cluster/neighbor');

class ExternalLib {
    constructor() {
        this.lib = 'external';
        this.version = 1;
    }

    showInfo() {
        console.log(`${this.lib}, version ${this.version}`);
    }

    updateVersion(version) {
        this.version = version;
    }
}

class DependentActor extends AbstractActor {
    constructor() {
        super('dependent0');
        this.externalLib = new ExternalLib();
    }

    builder() {
        return {
            _ : (self, envelope) => {
                console.log('Hello!');
                console.log(self.externalLib);
                console.log(`Reveal external lib, info : ${self.externalLib.showInfo()}`);
                self.updateVersion(2);
                console.log(`Update, info : ${self.externalLib.showInfo()}`);
            }
        }
    }
}

let actorSystem = new ActorSystem([new Neighbor('127.0.0.1', 6772, 11001)])
    .create(new DependentActor())
    .tell('dependent0', null, { host: '127.0.0.1', port: 6772 });