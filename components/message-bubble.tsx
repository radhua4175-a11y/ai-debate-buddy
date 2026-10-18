interface Props {
  author: string;
  avatar: string;
  content: string;
  mine: boolean;
}

/** AI and student text is rendered as plain text (never HTML), so it can't inject markup. */
export function MessageBubble({ author, avatar, content, mine }: Props) {
  return (
    <div className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">
        {avatar}
      </span>
      <div className={`flex max-w-[85%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <span className="mb-1 text-sm font-bold text-muted">{author}</span>
        <p
          className={`whitespace-pre-wrap break-words rounded-3xl px-5 py-3 text-lg ${
            mine ? "bg-primary text-primary-foreground" : "border-2 border-border bg-background"
          }`}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
