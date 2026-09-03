import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import RemoveFriendButton from '@/components/remove-friend-button';

export default async function FriendList() {
  const user = await getCurrentUser();

  const friends = user
    ? await prisma.friendship.findMany({
        where: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : [];

  return (
    <div>
      <div className="w-19/20 mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md h-200 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Friends</h2>
        <div className="flex flex-col gap-4">
          {friends.map((item) => {
            const friend = item.user1Id === user?.id ? item.user2 : item.user1;
            const key = `${item.user1Id}-${item.user2Id}`;

            return (
              <div key={key}>
                <div className="flex items-center justify-between w-19/20 mx-auto p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl h-auto min-h-0 break-words whitespace-normal">
                  <span>{friend.username}</span>

                  <RemoveFriendButton
                    friendId={friend.id}
                    friendUsername={friend.username}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div></div>
    </div>
  );
}
