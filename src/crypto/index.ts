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

/*
    index.ts
    Main entrypoint for crypto functions
*/

import { createCipheriv, createDecipheriv, createHash } from 'crypto'

const secret = process.env.SECRET || 'not set'

if (secret === 'not set') {
  throw new Error('SECRET is not set!')
}

process.env.SECRET = '***OMITTED***'

function createIVFromAdditionalSecret(additionalSecret: string) {
  return additionalSecret + '*'.repeat(16-additionalSecret.length)
}

export function hash(data: string) {
  const hash = createHash('sha256')
  hash.update(`${secret}${data}`)
  return hash.digest('hex')
}

export function encrypt(data: string, additionalSecret: string) {
  const iv = createIVFromAdditionalSecret(additionalSecret)
  const cipher = createCipheriv('aes-128-cbc', `${secret}`, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function decrypt(data: string, additionalSecret: string) {
  const iv = createIVFromAdditionalSecret(additionalSecret)
  const cipher = createDecipheriv('aes-128-cbc', `${secret}`, iv)
  let decrypted = cipher.update(data, 'hex', 'utf8')
  decrypted += cipher.final('utf8')
  return decrypted
}
