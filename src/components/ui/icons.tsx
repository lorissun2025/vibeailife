import { Loader2, Mail, ArrowLeft, MessageCircle, Send, Plus, Trash2 } from "lucide-react"

export const Icons = {
  google: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25-.56v-2.21c1.32-.59 2.22-1.92 2.22-3.28 0-1.52-.87-2.76-2.22-3.28v-2.21c1.32-.59 2.22-1.92 2.22-3.28 0-1.52-.87-2.76-2.22-3.28z"
        fill="currentColor"
      />
      <path
        d="M5.98 13.02c-.31 0-.61-.05-.9-.14-.27-.09-.53-.21-.77-.37-.24-.15-.47-.39-.65-.65-.18-.26-.32-.56-.41-.91-.09-.35-.14-.72-.14-1.1 0-.78.07-1.53.2-2.25.56v-2.21c1.32-.59 2.22-1.92 2.22-3.28 0-1.52-.87-2.76-2.22-3.28z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  ),
  loader: Loader2,
  mail: Mail,
  arrowLeft: ArrowLeft,
  message: MessageCircle,
  send: Send,
  plus: Plus,
}

// Re-export as components for convenience
export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => <ArrowLeft {...props} />
export const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => <MessageCircle {...props} />
export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <Send {...props} />
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <Plus {...props} />
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <Trash2 {...props} />
