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

const Envelope = require('./envelope');
const assert = require('assert');

class AbstractActor {

  constructor(name) {
    this._context = null;
    assert(name, 'Name should be set.');
    this._name = name;
    this._recv0 = this.receive;
    this._precv0 = this._recv0;
    this._destruct0 = null;
  }

  receive() {

  }

  destruct() {

  }

  roll(fn) {
    if (fn) {
      this._recv0 = fn;
      this._precv0 = this._recv0;
    }
  }

  rollback() {
    let tmp = this._recv0;
    this._recv0 = this._precv0;
    this._precv0 = tmp;
  }

  tell(address, content) {
    let envelope = new Envelope(this._name, address, content);
    this._context.forward(envelope);
  }

  ask(address, content) {
    let envelope = new Envelope(this._name, address, content, true);
    this._context.forward(envelope);
  }

  get recv0() {
    return this._recv0;
  }

  set recv0(fn) {
    this._recv0 = fn;
  }

  get context() {
    return this._context;
  }

  set context(context) {
    this._context = context;
  }

  get destruct0() {
    return this._destruct0;
  }

  set destruct0(fn) {
    this._destruct0 = fn;
  }

  get name() {
    return this._name;
  }
}

module.exports = AbstractActor;