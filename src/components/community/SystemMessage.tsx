interface SystemMessageProps {
  content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
  return (
    <div className="flex justify-center px-2">
      <div className="bg-muted/50 text-muted-foreground text-xs sm:text-sm px-4 py-2 rounded-full border border-border/50 max-w-[90%] text-center">
        {content}
      </div>
    </div>
  );
}
