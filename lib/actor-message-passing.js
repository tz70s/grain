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

const coap = require('coap');
const { EventEmitter } = require('events');

class ActorMessagePassing {
  constructor(actorMetaDirectory) {
    this._port = Math.floor(Math.random() * 20000);
    this._server = coap.createServer();
    this._actorMetaDirectory = actorMetaDirectory;
    this._spawn();
    this._actorMetaDirectory.setMessagePassingMeta(this._port);
  }

  _spawn() {
    this._server.listen(this._port, () => { });
    this._server.on('request', (req, res) => {
      if (req.url.split('/')[1] === 'envelope') {
        this._envelopeHandler(req.payload.toString());
        res.end('Ok');
      }
    })
  }

  _envelopeHandler(raw) {
    let envelope = null;
    try {
      envelope = JSON.parse(raw);
    } catch (error) { }
    if (!(!!envelope.from && !!envelope.address)) envelope = null;

    // TODO: Forward to hosting.
  }

  mailTo(_nodeId, envelope) {
    // Ask directory for name
    let nodeId = _nodeId;
    // Ask message passing address
    this._actorMetaDirectory.getMessagePassingMeta(nodeId)
      .then((res) => {
        console.log(res);
        let req = coap.request(`coap://${res.messageAddress}/envelope`);
        req.write(JSON.stringify(envelope));
        req.on('response', (res) => {
          console.log(res.payload.toString());
        })
        req.end();
      })
      .catch((err) => {
        console.error(`The requests node's message passing address is not existed`);
        console.error(err);
      })
  }

}

module.exports = ActorMessagePassing;