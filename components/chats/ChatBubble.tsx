import { cn } from "@/lib/utils";

export function ChatBubble({ message, sender, time }: { message: string; sender: "lead" | "bot"; time: string }) {
  return (
    <div className={cn("mb-3 flex", sender === "bot" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-3 py-2 text-sm",
          sender === "bot" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-900"
        )}
      >
        <p>{message}</p>
        <p className={cn("mt-1 text-[10px]", sender === "bot" ? "text-blue-100" : "text-slate-500")}>
          {time}
        </p>
      </div>
    </div>
  );
}
