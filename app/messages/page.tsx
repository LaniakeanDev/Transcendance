import { PrivateMessageForm } from '@/components/message-form';
import MessageHistory from '@/components/message-history';

export default function PrivateMessages() {
  return (
    <main>
      <div className="flex flex-col gap-4 min-h-0 flex-1">
        <div>
          <PrivateMessageForm />
        </div>
        <div>
          <MessageHistory />
        </div>
        <div></div>
      </div>
    </main>
  );
}
