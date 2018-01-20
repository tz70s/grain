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

    /** CRLF, a.k.a. \r\n */
    static get CRLF() {
        return '\r\n';
    }

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

    /** HANDSHAKE message type */
    static get HANDSHAKE_TYPE() {
        return 'handshake';
    }

    /**
     * @param {string} rawString 
     */
    static marshall(rawString) {
        let objects = [];
        let messages = rawString.split(this.CRLF);
        for (let message of messages) {
            let object = null;
            try {
                object = JSON.parse(message);
            } catch (error) {
                object = null;
            }
            if (object) {
                if (object.type) {
                    objects.push(object);
                }
            }
        }
        return objects;
    }

    constructor(type) {
        this.type = type;
    }

    toString() {
        return `${JSON.stringify(this)}${MessageCodec.CRLF}`;
    }
}

class HandShakeMessageCodec extends MessageCodec {
    constructor(actorSystemId) {
        super(MessageCodec.HANDSHAKE_TYPE);
        this.actorSystemId = actorSystemId;
    }
}

class PingMessageCodec extends MessageCodec {
    /**
     * While constructing a ping message, it will carry data with known carrier.
     * The known carriers is an object which records other clusters liveness, 
     * therefore to reduce the liveness check from multicast.
     * Similar to gossiping.
     * @param {Object} knownCarrier 
     */
    constructor(actorSystemId, knownCarrier = {}) {
        super(MessageCodec.PING_TYPE);
        this.actorSystemId = actorSystemId;
        this.knownCarrier = knownCarrier;
    }
}

class ActorMessageCodec extends MessageCodec {
    /**
     * @param {Envelope} envelope 
     */
    constructor(actorSystemId, envelope) {
        super(MessageCodec.ACTOR_TYPE);
        if (envelope) {
            this.envelope = envelope;
        } else {
            throw new Error('Missing envelope object in argument.')
        }
    }
}

class SyncMessageCodec extends MessageCodec {
    /**
     * @param {Array<Object>} knownActors 
     */
    constructor(knownActors) {
        super(MessageCodec.SYNC_TYPE);
    }
}

module.exports = {
    MessageCodec : MessageCodec,
    HandShakeMessageCodec : HandShakeMessageCodec,
    PingMessageCodec : PingMessageCodec,
    ActorMessageCodec : ActorMessageCodec
}