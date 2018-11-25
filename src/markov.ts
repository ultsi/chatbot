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

/*
    markov.ts
    Simple general implementation of markov chains
    Reinvented the wheel just because felt like it
*/

export class MarkovTextGenerator {
  order: number
  delimiter: string
  mKeys: string[]
  mPartialKeys: {
    [key: string]: string[]
  }
  mData: {
    [key: string]: string[]
  }

  constructor(order: number, delimiter: string = '') {
    this.order = order
    this.delimiter = delimiter
    this.mKeys= []
    this.mPartialKeys = {}
    this.mData = {}
  }

  seed(data: string[]) {
    data.forEach((row: string) => {
      const splitData = row.split(this.delimiter)
      splitData.forEach((item: string, i: number) => {
        const orderTuple = splitData.slice(i, i + this.order).join(this.delimiter)
        if (!this.mData[orderTuple]) {
          this.mData[orderTuple] = []
          this.mKeys.push(orderTuple)
          const orderKeys = orderTuple.split(this.delimiter)
          for (let k in orderKeys) {
            let partialKey = orderKeys[k]
            if (!this.mPartialKeys[partialKey]) {
              this.mPartialKeys[partialKey] = []
            }
            this.mPartialKeys[partialKey].push(orderTuple)
          }
        }
        this.mData[orderTuple].push(splitData[i + this.order])
      })
    })
  }

  generate(key: string, limit: number) {
    let counter = 0
    let generated = []
    let nextKey = key
    while (this.mData[nextKey] && counter < limit) {
      counter += 1
      let nextItem = this.mData[nextKey][Math.floor(Math.random() * this.mData[nextKey].length)]
      generated.push(nextItem)
      if (this.order > 1) {
        nextKey = nextKey.split(this.delimiter).slice(1, this.order).join(this.delimiter) + this.delimiter + nextItem
      } else {
        nextKey = nextItem
      }
    }
    return generated
  }

  randomKey() {
    return this.mKeys[Math.floor(Math.random() * this.mKeys.length)]
  }

  findPartialKeyFromData(data: string): string {
    const splittedData = data.split(this.delimiter)
    let foundByKey: any = {}
    splittedData.forEach((item: string, i: number) => {
      if (this.mPartialKeys[item]) {
        foundByKey[item] = this.mPartialKeys[item]
      }
    })
    let found = []
    for (let point in foundByKey)  {
      found.push(foundByKey[point])
    }
    let foundKey = found[Math.floor(Math.random() * found.length)]

    if (foundKey)  {
      return foundKey[Math.floor(Math.random() * foundKey.length)]
    } else {
      return ''
    }
  }

}