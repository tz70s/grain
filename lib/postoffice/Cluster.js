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

const NodeState = {
    UNKNOWN : 0,
    RUNNING : 1,
    FAILED : 2
};

class ClusterTracker {

    constructor() {
        this.records = [new Node('0.0.0.0', NodeState.RUNNING)];
    }

    setNodeState(address, state) {
        // Checkout if address is existed or not.
        let node = this.records.find((node) => {
            return  (node.address === address);
        });
        if (node) {
            node.state = state;            
        } else {
            this.records.push(new Node(address, state));
        }
    }

    setCarriers(carriers) {
        if (carriers instanceof Array) {
            carriers.forEach((carrier) => { setNodeState(carrier.address, carrier.state); })
        } else {
            throw new Error('Wrong carriers type in Clustered SetCarriers');
        }
    }
}

class Node {

    constructor(address, state) {
        this._address = address;
        this._state = state || NodeState.UNKNOWN;
        this._lastCheck = Date.now();
    }

    get address() {
        return this._address;
    }

    get state() {
        return this._state;
    }

    set state(state) {
        if ((state !== NodeState.UNKNOWN) && (state !== NodeState.RUNNING) && (state !== NodeState.FAILED)) {
            throw new Error('Not configurable states, need to check!');
        }
        this._state = state;
    }
}

module.exports = {
    ClusterTracker: ClusterTracker,
    Node: Node,
    NodeState: NodeState
}