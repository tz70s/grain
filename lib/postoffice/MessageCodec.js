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

class MessageCodec {

    /** PING message type */
    static get PING_TYPE() {
        return 'ping';
    }

    /** ACTOR message type */
    static get ACTOR_TYPE() {
        return 'actor';
    }

    /** SYNC message type */
    static get SYNC_TYPE() {
        return 'sync';
    }

    /**
     * @param {string} rawMessage 
     */
    static marshall(rawMessage) {
        let object = null;
        try {
            object = JSON.parse(rawMessage);
        } catch (error) {
            console.error(`Not acceptable message format! ${rawMessage}`);
            return null;
        }
        switch(object.type) {
            case this.PING_TYPE:
                console.log('Is ping type!');
                break;
            case this.ACTOR_TYPE:
                console.log(envelope._address);
                break;
            case this.SYNC_TYPE:
                console.log('Is sync type');
                break;
            default:
                console.error(`Not acceptable message type! ${rawMessage}`);
                return null;
        }
        return object;
    }
}

class PingMessageCodec {
    /**
     * While constructing a ping message, it will carry data with known carrier.
     * The known carriers is an object which records other clusters liveness, 
     * therefore to reduce the liveness check from multicast.
     * Similar to gossiping.
     * @param {Object} knownCarrier 
     */
    constructor(knownCarrier = {}) {
        this.type = MessageCodec.PING_TYPE;
        this.knownCarrier = knownCarrier;
    }
}

class ActorMessageCodec {
    /**
     * @param {Envelope} envelope 
     */
    constructor(envelope) {
        this.type = MessageCodec.ACTOR_TYPE;
        if (envelope) {
            this.envelope = envelope;
        } else {
            throw new Error('Missing envelope object in argument.')
        }
    }
}

class SyncMessageCodec {
    /**
     * @param {Array<Object>} knownActors 
     */
    constructor(knownActors) {

    }
}

module.exports = {
    MessageCodec : MessageCodec,
    PingMessageCodec : PingMessageCodec,
    ActorMessageCodec : ActorMessageCodec
}