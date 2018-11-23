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
    Main entrypoint for db functions
*/

import { Pool } from 'pg'
import { hash, encrypt } from '../crypto'

const db_uri = process.env.DATABASE_URL || 'not set'

if (db_uri === 'not set') {
  throw new Error('DATABASE_URL is not set!')
}

process.env.DATABASE_URL = '***OMITTED***'

const dbPool = new Pool({
  connectionString: db_uri
})

export async function query(text: string, params: any) {
  return dbPool.query(text, params)
}

export async function selectChatMsgs(chatId: number) {
  return query('select * from msgs where chatId=$1', [hash(chatId.toString())])
}

export async function saveMsg(chatId: number, message: string) {
  return query('insert into msgs (chatId, msg) values ($1, $2)', [hash(chatId.toString()), encrypt(message, chatId.toString())])
}