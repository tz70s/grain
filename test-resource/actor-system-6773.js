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
const { PeersFactory } = require('../lib/meta/peer');

let peers = PeersFactory(6772, 6773);
let actorSystem = new ActorSystem({ port: 6773 }, peers);

actorSystem.actorOf('hello-actor-123', __dirname + '/../example/debugger-actor.js', 0.1)
  .then((name) => { 
    actorSystem.tell('10.43.244.224:6772', 'Hello message passing!');
  })
  .catch((error) => { console.error(error); });
