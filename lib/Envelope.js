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

class Envelope {

    constructor(address, content) {
        this._address = address;
        this._content = content;
        // Default is not to guarantee transferring
        this._guaranteee = false;
    }

    get guarantee() {
        return this._guaranteee;
    }

    set guarantee(newGuarantee) {
        if (newGuarantee instanceof Boolean) {
            this._guaranteee = newGuarantee;
        }
    }

    get address() {
        return this._address;
    }

    get content() {
        return this._content;
    }
}

module.exports = Envelope;