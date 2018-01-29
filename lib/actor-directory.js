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
const ActorMetaEntry = require('./actor-meta');

class ActorMetaDirectory {

  constructor(opts, peers) {
    this._port = opts.port || 6772;
    this._peers = peers;
    this._upring = new Upring({ hashring: { port: this._port }, logLevel: 'info'});
    assert(this._upring, 'upring shold be created.');
    this._spawn();
    this._ready = false;
    this._joined = false;
    this._localEvents = new EventEmitter();
  }

  _spawn() {
    this._upring.on('up', () => {
      let selfId = this._upring.whoami();
      this._selfId = selfId;
      this._ready = true;
      this._localEvents.emit('self-ready');
      // this.setMessagePassingDebuggerMeta();
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
      this._upring.add({ cmd: 'actor', key: name }, (req, reply) => { 
        reply(null, new ActorMetaEntry(name, code, location, version));
      });
    } else {
      this._localEvents.once('self-ready', () => {
        this._upring.add({ cmd: 'actor', key: name }, (req, reply) => { 
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
      return this._upring.requestp({ cmd: 'actor', key: name });
    } else {
      return await new Promise((resolve, reject) => {
        this._localEvents.once('join-ready', () => {
          resolve(this._upring.requestp({ cmd: 'actor', key: name }));
        })
      });
    }
  }

  setMessagePassingDebuggerMeta() {
    if (this._ready) {
      this._upring.add({ cmd: 'message'}, (req, reply) => {
        console.log('Get key : ', req.key);
        reply(null, { message: 'Ok' });
      });
    } else {
      this._localEvents.on('self-ready', () => {
        this._upring.add({ cmd: 'message' }, (req, reply) => {
          console.log('Get key : ', req.key);
          reply(null, { message: 'Ok' });
        }); 
      });
    } 
  }

  setMessagePassingMeta(port) {
    if (this._ready) {
      this._upring.add({ cmd: 'message', key: `${this._selfId}`}, (req, reply) => {
        reply(null, { messageAddress : `${this._selfId.split(':')[0]}:${port}` });
      });
    } else {
      this._localEvents.on('self-ready', () => {
        console.log(`Add message passing meta at ${this._selfId}`);
        this._upring.add({ cmd: 'message', key: this._selfId }, (req, reply) => {
          reply(null, { messageAddress : `${this._selfId.split(':')[0]}:${port}` });
        }); 
      });
    } 
  }

  async getMessagePassingMeta(id) {
    if (this._ready && this._joined) {
      return this._upring.requestp({ cmd: 'message', key: id });
    } else {
      return await new Promise((resolve, reject) => {
        this._localEvents.once('join-ready', () => {
          console.log('Joined, ', id);
          resolve(this._upring.requestp({ cmd: 'message', key: id }));
        });
      });
    }
  }

  get port() {
    return this._port;
  }

}

module.exports = ActorMetaDirectory;