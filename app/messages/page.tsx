import { PrivateMessageForm } from '@/components/message-form';
import MessageHistory from '@/components/message-history';
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany();

export default function PrivateMessages() {
  return (
    <main>
      <div className="flex flex-col gap-4 min-h-0 flex-1">
        <div>
          <PrivateMessageForm users={users} />
        </div>
        <div>
          <MessageHistory />
        </div>
        <div></div>
      </div>
    </main>
  );
}
