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

const Swim = require('swim');
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;

const DefaultOps = {
    local: {
        host: null,
        meta: {'application' : 'info'}
    },
    codec: 'msgpack',
    disseminationFactor: 15,
    interval: 100,
    joinTimeout: 200,
    pingTimeout: 20,
    pingReqTimeout: 60,
    pingReqGroupSize: 3,
    suspectTimeout: 60,
    udp: { maxDgramSize: 512 },
    preferCurrentMeta: true
};

const FailureState = {
    Alive: 0,
    Suspect: 1,
    Fault: 2
};

class FailureManager {
    constructor(host, neighbors) {
        this._opts = DefaultOps;
        assert(host, 'Host is required field');
        this._opts.local.host = host;
        this._swim = new Swim(this._opts);
        this._hosts = new Map();
        this._neighbors = neighbors;
        this._eventBroker = new EventEmitter();
        this._hostsToJoin = [];
        for (let neighbor of neighbors) {
            let memberString = `${neighbor.host}:${neighbor.liveChannel}`;
            this._hostsToJoin.push(memberString);
            this._hosts.set(memberString, FailureState.Suspect);
        }
        this._bootstrap();
    }

    _bootstrap() {
        this._swim.bootstrap(this._hostsToJoin, () => {
            for (let member of this._swim.members()) {
                this._eventBroker.emit(member.host, member.state);
                this._hosts.set(member.host, member.state);
            }
           
            this._swim.on(Swim.EventType.Change, (update) => {
                this._eventBroker.emit(update.host, update.state);
                this._hosts.set(update.host, update.state);
            });

            this._swim.on(Swim.EventType.Update, (update) => {
                this._eventBroker.emit(update.host, update.state);
                this._hosts.set(update.host, update.state);
            });
        })
    }

    stateHandler(host, callback) {
        if ((this._hosts.get(host) === FailureState.Alive) || (this._hosts.get(host) === FailureState.Fault)) {
            callback(this._hosts.get(host));
        } else {
            this._eventBroker.once(host, callback);
        }
    }

    removeHandler(host) {
        this._eventBroker.removeListener(host, () => {});
    }

    _dataChannelToLiveChannel(dataChannel) {
        // REMARK: unsafe equals for converting string and number
        let neighbor = this._neighbors.find( (neighbor) => { return (neighbor.dataChannel == dataChannel); });
        if (neighbor) {
            return neighbor.liveChannel;
        }
    }

    _liveChannelToDataChannel(liveChannel) {
        // REMARK: unsafe equals for converting string and number
        let neighbor = this._neighbors.find( (neighbor) => { return (neighbor.liveChannel === liveChannel); });
        if (neighbor) {
            return neighbor.dataChannel;
        }
    }

    dataHostToLiveHost(host) {
        let dataChannel = host.split(':')[1];
        return `${host.split(':')[0]}:${this._dataChannelToLiveChannel(dataChannel)}`
    }
}

module.exports = {
    FailureManager: FailureManager,
    FailureState: FailureState
};