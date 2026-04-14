declare module 'node-telegram-bot-api' {
  export interface SendMessageOptions {
    parse_mode?: string
  }

  export default class TelegramBot {
    constructor(token: string, options: { polling: boolean })
    sendMessage(chatId: string, text: string, options?: SendMessageOptions): Promise<any>
  }
}
