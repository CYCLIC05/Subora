declare module 'node-telegram-bot-api' {
  export interface SendMessageOptions {
    parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2';
    reply_markup?: {
      inline_keyboard?: InlineKeyboardButton[][];
      keyboard?: KeyboardButton[][];
      remove_keyboard?: boolean;
      force_reply?: boolean;
    };
  }

  export interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
  }

  export interface KeyboardButton {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
  }

  export interface ChatInviteLink {
    invite_link: string;
    creator: any;
    is_primary: boolean;
    is_revoked: boolean;
    expire_date?: number;
    member_limit?: number;
  }

  export default class TelegramBot {
    constructor(token: string, options: { polling: boolean });
    getMe(): Promise<any>;
    getChatMember(chatId: string | number, userId: number): Promise<any>;
    sendMessage(chatId: string | number, text: string, options?: SendMessageOptions): Promise<any>;
    createChatInviteLink(
      chatId: string | number,
      options?: {
        name?: string;
        expire_date?: number;
        member_limit?: number;
        creates_join_request?: boolean;
      }
    ): Promise<ChatInviteLink>;
    createInvoiceLink(
      title: string,
      description: string,
      payload: string,
      provider_token: string,
      currency: string,
      prices: Array<{ label: string; amount: number }>,
      options?: any
    ): Promise<string>;
  }
}
