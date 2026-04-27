import { createContext } from 'react';

export const ChatContext = createContext({
  chats: [],
  openChat: () => {},
  showChat: () => {},
  totalUnread: 0,
});