import { PrivateMessageForm } from '@/components/message-form';
import MessageHistory from '@/components/message-history';
import { prisma } from '@/lib/prisma';


export default async function PrivateMessages() {
  const users = await prisma.user.findMany();

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