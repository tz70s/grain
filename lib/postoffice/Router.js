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

class Router {
    
    constructor() {
        this._routingTable = new Map();
    }

    /**
     * @param {string} actorSystemId 
     * @param {boolean} isServerSideSocket
     * @param {socket} socket 
     */
    addRoutingRule(actorSystemId, isServerSideSocket, socket) {
        if (this._routingTable.has(actorSystemId)) {
            this._routingTable.get(actorSystemId).push({ isServerSideSocket: isServerSideSocket, socket: socket });
        } else {
            this._routingTable.set(actorSystemId, [{ isServerSideSocket: isServerSideSocket, socket: socket }]);
        }
    }

    lookUpFromActorSystemId(actorSystemId) {
        if (this._routingTable.has(actorSystemId)) {
            return this._routingTable.get(actorSystemId)[0].socket;
        } else {
            return null;
        }
    }

    lookUpFromSocket(socket) {
        let ret = null;
        this._routingTable.forEach( (val, key) => {
            for (let sock of val) {
                if (sock.socket === socket) {
                    ret = key;
                    break;
                }
            }
        })
        return ret;
    }

    deleteRuleFromSocket(socket) {
        this._routingTable.forEach( (val, key) => {
            let out = val.filter((sock) => {
                return (sock.socket === socket);
            });
            if (out) {
                if (out.length === 0) {
                    this._routingTable.delete(key);
                } else {
                    this._routingTable.set(key, out);
                }
            }
        })
    }
}

module.exports = Router;