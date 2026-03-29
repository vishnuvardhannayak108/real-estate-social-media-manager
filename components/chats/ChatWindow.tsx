import type { Chat } from "@/lib/types";
import { formatIST } from "@/lib/format";

import { ChatBubble } from "@/components/chats/ChatBubble";

export function ChatWindow({ chats }: { chats: Chat[] }) {
  if (chats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">
        No chat messages yet.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg border bg-slate-50 p-4">
      {chats.map((chat) => (
        <ChatBubble
          key={chat.id}
          message={chat.message}
          sender={chat.sender}
          time={formatIST(chat.timestamp)}
        />
      ))}
    </div>
  );
}
