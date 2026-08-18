import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const messages_mockup = [
  'hi',
  'hello',
  'coucou',
  'hello',
  'coucou',
  'hello',
  'coucou',
  'hello',
  'coucou',
];

export default async function MessageHistory() {
  const user = await getCurrentUser();
  const messages = user
    ? await prisma.message.findMany({
        where: {
          OR: [{ senderId: user.id }, { receiverId: user.id }],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
          receiver: {
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
        <h2 className="text-2xl font-semibold mb-6 text-center">MESSAGES</h2>
        <div className="flex flex-col gap-4">
          {messages.map((item, index) => (
            <div key={index}>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                FROM: {item.sender.username} {'->'} TO: {item.receiver.username}{' '}
                | {}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(item.createdAt)}
              </label>

              <div className="block w-19/20 mx-auto p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                {item.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div></div>
    </div>
  );
}
