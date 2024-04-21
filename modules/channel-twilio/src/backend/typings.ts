import { TwilioClient } from './client'

export interface Clients {
  [botId: string]: TwilioClient
}

export interface MessageOption {
  label: string
  value: string
  type: 'say_something' | 'postback' | 'quick_reply' | 'url'
}

export interface TwilioRequestBody {
  To: string
  From: string
  Body: string
  Latitude: string
  Longitude: string
  NumMedia: string
  MediaContentType0: string
  MediaUrl0: string
}
