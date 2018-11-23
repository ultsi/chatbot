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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
/*
    index.ts
    Main entrypoint
*/
var node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
var db_1 = require("./db");
var crypto_1 = require("./crypto");
var markov_1 = require("./markov");
var MARKOV_ORDER = 2;
var MARKOV_DELIMITER = ' ';
var MARKOV_RESPONSE_LIMIT = 15;
var BOT_NAME = 'Mertsibot';
var CHANCE = 0.15;
var end_letters = ['.', '?', '!', '.', '?', '!', '.', '?', '!', '...', '!?', '???', " :D", " xD"];
var token = process.env.TOKEN || 'not set';
process.env.TOKEN = '***SECRET***';
if (token === 'not set') {
    throw new Error('TOKEN is not set!');
}
var bot = new node_telegram_bot_api_1.default(token, { polling: true });
var markovGenerators = {};
bot.on('message', function (msg) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, wordsWithoutHighlights, text, mention, markovGenerator, res, generator, seedData, foundKey, generatedResponse, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chatId = msg.chat.id;
                if (!msg.text || msg.chat.type === 'private' || msg.chat.type === 'channel' || !msg.from || msg.from.is_bot)
                    return [2 /*return*/];
                wordsWithoutHighlights = msg.text.toLowerCase().split(MARKOV_DELIMITER).map(function (word) {
                    return word[0] === '@' ? word.substring(1) : word;
                });
                text = wordsWithoutHighlights.join(MARKOV_DELIMITER);
                mention = wordsWithoutHighlights[0] === "" + BOT_NAME.toLowerCase();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                markovGenerator = markovGenerators[chatId];
                if (!!markovGenerator) return [3 /*break*/, 3];
                return [4 /*yield*/, db_1.selectChatMsgs(chatId)];
            case 2:
                res = _a.sent();
                generator = new markov_1.MarkovTextGenerator(MARKOV_ORDER, MARKOV_DELIMITER);
                markovGenerators[chatId] = generator;
                if (res.rows.length > 0) {
                    seedData = decryptChatMsgs(chatId, res.rows);
                    generator.seed(seedData);
                }
                return [3 /*break*/, 4];
            case 3:
                // react to messages based on chance or mention
                if (Math.random() > 1 - CHANCE || mention) {
                    foundKey = markovGenerator.findPartialKeyFromData(text);
                    if (foundKey !== '') {
                        generatedResponse = markovGenerator.generate(foundKey, MARKOV_RESPONSE_LIMIT).join(MARKOV_DELIMITER);
                        if (generatedResponse.length > 0) {
                            // make text start with a capital letter and end in a period
                            foundKey = foundKey[0].toUpperCase() + foundKey.substring(1);
                            if (generatedResponse[generatedResponse.length - 1].match(/\w/g)) {
                                generatedResponse += randomEnding();
                            }
                            bot.sendMessage(chatId, foundKey + " " + generatedResponse);
                        }
                    }
                }
                _a.label = 4;
            case 4:
                if (wordsWithoutHighlights.length < MARKOV_ORDER + 1)
                    return [2 /*return*/];
                return [4 /*yield*/, db_1.saveMsg(chatId, wordsWithoutHighlights.join(MARKOV_DELIMITER))];
            case 5:
                _a.sent();
                markovGenerators[chatId].seed([wordsWithoutHighlights.join(MARKOV_DELIMITER)]);
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                console.log(err_1);
                bot.sendMessage(62461364, "Chatbot error: " + err_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
function decryptChatMsgs(chatId, chatIdMsgRow) {
    var decryptedMsgs = chatIdMsgRow.map((function (row) {
        return crypto_1.decrypt(row.msg, chatId.toString());
    }));
    return decryptedMsgs;
}
function randomEnding() {
    return end_letters[Math.floor(Math.random() * end_letters.length)];
}
