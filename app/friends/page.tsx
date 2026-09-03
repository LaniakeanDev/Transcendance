import { FriendForm } from '@/components/friend-form';
import FriendList from '@/components/friend-list';
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany();

export default function Friends() {
  return (
    <main>
      <div className="flex flex-col gap-4 min-h-0 flex-1">
        <div>
          <FriendForm users={users} />
        </div>
        <div>
          <FriendList />
        </div>
        <div></div>
      </div>
    </main>
  );
}
