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

const assert = require('assert');
const Upring = require('upring');
const { EventEmitter } = require('events');
const ActorMetaEntry = require('./meta/actor-meta-entry');

class ActorMetaDirectory {

  constructor(opts, peers) {
    this._port = opts.port || 6772;
    this._peers = peers;
    this._upring = new Upring({ hashring: { port: this._port } });
    assert(this._upring, 'upring shold be created.');
    this._upring.use(require('upring-pubsub'));
    this._spawn();
    this._ready = false;
    this._joined = false;
    this._localEvents = new EventEmitter();
  }

  _spawn() {
    this._upring.on('up', () => {
      let selfId = this._upring.whoami();
      this._localEvents.emit('self-ready');
      this._ready = true;
      for (let peer of this._peers) {
        let peerId = selfId.replace(this._port, peer.port);
        if (peerId !== selfId) {
          this._upring.join(peerId, (error) => {
            if (!error) {
              this._joined = true;
              this._localEvents.emit('join-ready');
            }
          });
        }
      }
    });
  }

  setActorMeta(name, code, location, version) {
    if (this._ready) {
      this._upring.add({ key: name }, (req, reply) => { 
        reply(null, new ActorMetaEntry(name, code, location, version));
      });
    } else {
      this._localEvents.once('self-ready', () => { 
        this._upring.add({ key: name }, (req, reply) => { 
          reply(null, new ActorMetaEntry(name, code, location, version));
        }); 
      });
    }
  }

  /**
   * @param {string} name
   * @returns {promise} return a promise of actor meta 
   */
  async getActorMeta(name) {
    if (this._ready && this._joined) {
      return this._upring.requestp({ key: name });
    } else {
      return await new Promise((resolve, reject) => {
        this._localEvents.once('join-ready', () => {
          resolve(this._upring.requestp({ key: name }));
        })
      });
    }
  }

  subscribe(topic, fn) {
    if (this._ready) {
      this._upring.pubsub.on(topic, fn);
    } else {
      this._localEvents.once('self-ready', () => {
        this._upring.pubsub.on(topic, fn);
      })
    }
  }

  publish(topic, message) {
    this._upring.pubsub.emit({ topc: topic, message: message });
  } 
}

module.exports = {
  ActorMetaDirectory
};