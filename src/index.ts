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
    Main entrypoint
*/

import TelegramBot, { Message } from 'node-telegram-bot-api'
import { selectChatMsgs, saveMsg } from './db'
import { decrypt } from './crypto';
import { MarkovTextGenerator } from './markov'

const MARKOV_ORDER = 2
const MARKOV_DELIMITER = ' '
const MARKOV_RESPONSE_LIMIT = 15
const BOT_NAME = 'Mertsibot'
const CHANCE = 0.15
const end_letters = ['.', '?', '!', '.', '?', '!', '.', '?', '!', '...', '!?', '???', " :D", " xD"]

const token = process.env.TOKEN || 'not set'
process.env.TOKEN = '***SECRET***'

if (token === 'not set') {
  throw new Error('TOKEN is not set!')
}

const bot = new TelegramBot(token, {polling: true})

const markovGenerators: {
  [chatId: number]: MarkovTextGenerator
} = {}

bot.on('message', async (msg: Message) => {
  const chatId = msg.chat.id
  if(!msg.text || msg.chat.type === 'private' || msg.chat.type === 'channel' || !msg.from || msg.from.is_bot) return

  // remove highlights
  const wordsWithoutHighlights = msg.text.toLowerCase().split(MARKOV_DELIMITER).map((word) => 
    word[0] === '@' ? word.substring(1) : word
  )
  const text = wordsWithoutHighlights.join(MARKOV_DELIMITER)
  const mention = wordsWithoutHighlights[0] === `${BOT_NAME.toLowerCase()}`
  try {
    const markovGenerator = markovGenerators[chatId]
    if(!markovGenerator) {
      const res = await selectChatMsgs(chatId)
      const generator = new MarkovTextGenerator(MARKOV_ORDER, MARKOV_DELIMITER)
      markovGenerators[chatId] = generator
      if (res.rows.length > 0) {
        const seedData = decryptChatMsgs(chatId, res.rows)
        generator.seed(seedData)
      }
    } else {
      // react to messages based on chance or mention
      if (Math.random() > 1-CHANCE || mention) {
        let foundKey = markovGenerator.findPartialKeyFromData(text)
        if (foundKey !== '') {
          let generatedResponse = markovGenerator.generate(foundKey, MARKOV_RESPONSE_LIMIT).join(MARKOV_DELIMITER)
          if (generatedResponse.length > 0) {

            // make text start with a capital letter and end in a period
            foundKey = foundKey[0].toUpperCase() + foundKey.substring(1);
            if (generatedResponse[generatedResponse.length - 1].match(/\w/g))  {
                generatedResponse += randomEnding();
            }
            bot.sendMessage(chatId, `${foundKey} ${generatedResponse}`)
          }
        }
      }
    }

    if (wordsWithoutHighlights.length < MARKOV_ORDER + 1) return

    await saveMsg(chatId, wordsWithoutHighlights.join(MARKOV_DELIMITER))
    markovGenerators[chatId].seed([msg.text])
  } catch (err) {
    console.log(err)
    bot.sendMessage(62461364, `Chatbot error: ${err}`)
  }
})

interface chatIdMsgRow {
  id: number,
  chatId: string,
  msg: string,
  created: string
}

function decryptChatMsgs(chatId: number, chatIdMsgRow: chatIdMsgRow[]): string[] {
  const decryptedMsgs: string[] = chatIdMsgRow.map(((row: chatIdMsgRow) => 
    decrypt(row.msg, chatId.toString())
  ))

  return decryptedMsgs
}

function randomEnding() {
  return end_letters[Math.floor(Math.random()*end_letters.length)]
}