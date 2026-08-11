// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getCurrentUser } from '@/lib/session';

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }
//     const { isLiked, postId, userId } = await request.json();
//     const likeId = await prisma.like.findUnique({
//       where: { postId, userId },
//       select: {
//         id: true
//       }
//     });
//     const like = await prisma.like.update
//   }
// }
