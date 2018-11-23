"use strict";
/*
    Chatbot, a markov chain chatbot for Telegram
    Copyright (C) 2018 Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*
    index.ts
    Main entrypoint for crypto functions
*/
var crypto_1 = require("crypto");
var secret = process.env.SECRET || 'not set';
if (secret === 'not set') {
    throw new Error('SECRET is not set!');
}
process.env.SECRET = '***OMITTED***';
function createIVFromAdditionalSecret(additionalSecret) {
    return additionalSecret + '*'.repeat(16 - additionalSecret.length);
}
function hash(data) {
    var hash = crypto_1.createHash('sha256');
    hash.update("" + secret + data);
    return hash.digest('hex');
}
exports.hash = hash;
function encrypt(data, additionalSecret) {
    var iv = createIVFromAdditionalSecret(additionalSecret);
    var cipher = crypto_1.createCipheriv('aes-128-cbc', "" + secret, iv);
    var encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
exports.encrypt = encrypt;
function decrypt(data, additionalSecret) {
    var iv = createIVFromAdditionalSecret(additionalSecret);
    var cipher = crypto_1.createDecipheriv('aes-128-cbc', "" + secret, iv);
    var decrypted = cipher.update(data, 'hex', 'utf8');
    decrypted += cipher.final('utf8');
    return decrypted;
}
exports.decrypt = decrypt;
