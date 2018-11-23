"use strict";
/*
    Chatbot, a markov chain chatbot for Telegram
    Copyright (C) 2017  Joonas Ulmanen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
Object.defineProperty(exports, "__esModule", { value: true });
/*
    markov.ts
    Simple general implementation of markov chains
    Reinvented the wheel just because felt like it
*/
var MarkovTextGenerator = /** @class */ (function () {
    function MarkovTextGenerator(order, delimiter) {
        if (delimiter === void 0) { delimiter = ''; }
        this.order = order;
        this.delimiter = delimiter;
        this.mKeys = [];
        this.mPartialKeys = {};
        this.mData = {};
    }
    MarkovTextGenerator.prototype.seed = function (data) {
        var _this = this;
        data.forEach(function (row) {
            var splitData = row.split(_this.delimiter);
            splitData.forEach(function (item, i) {
                var orderTuple = splitData.slice(i, i + _this.order).join(_this.delimiter);
                if (!_this.mData[orderTuple]) {
                    _this.mData[orderTuple] = [];
                    _this.mKeys.push(orderTuple);
                    var orderKeys = orderTuple.split(_this.delimiter);
                    for (var k in orderKeys) {
                        var partialKey = orderKeys[k];
                        if (!_this.mPartialKeys[partialKey]) {
                            _this.mPartialKeys[partialKey] = [];
                        }
                        _this.mPartialKeys[partialKey].push(orderTuple);
                    }
                }
                _this.mData[orderTuple].push(splitData[i + _this.order]);
            });
        });
    };
    MarkovTextGenerator.prototype.generate = function (key, limit) {
        var counter = 0;
        var generated = [];
        var nextKey = key;
        while (this.mData[nextKey] && counter < limit) {
            counter += 1;
            var nextItem = this.mData[nextKey][Math.floor(Math.random() * this.mData[nextKey].length)];
            generated.push(nextItem);
            if (this.order > 1) {
                nextKey = nextKey.split(this.delimiter).slice(1, this.order).join(this.delimiter) + this.delimiter + nextItem;
            }
            else {
                nextKey = nextItem;
            }
        }
        return generated;
    };
    MarkovTextGenerator.prototype.randomKey = function () {
        return this.mKeys[Math.floor(Math.random() * this.mKeys.length)];
    };
    MarkovTextGenerator.prototype.findPartialKeyFromData = function (data) {
        var _this = this;
        var splittedData = data.split(this.delimiter);
        var foundByKey = {};
        splittedData.forEach(function (item, i) {
            if (_this.mPartialKeys[item]) {
                console.log(item);
                foundByKey[item] = _this.mPartialKeys[item];
            }
        });
        var found = [];
        for (var point in foundByKey) {
            found.push(foundByKey[point]);
        }
        var foundKey = found[Math.floor(Math.random() * found.length)];
        if (foundKey) {
            return foundKey[Math.floor(Math.random() * foundKey.length)];
        }
        else {
            return '';
        }
    };
    return MarkovTextGenerator;
}());
exports.MarkovTextGenerator = MarkovTextGenerator;
