import { prisma } from '@/utils/db'
import type { User, list, learnSession } from '@prisma/client'

export async function makeLearnSessionFromId(listId: string, user: User) {
    const list = await prisma.list.findUnique({
        where: { id: listId }
    });
    if (!list) {
        throw new Error('List not found');
    }
    return makeLearnSession(list, user);
}

export async function makeLearnSession(list: list, user: User) {
    const learnsession = await prisma.learnSession.create({
        data: {
            listItems: list.items,
            parentList: { connect: { id: list.id } },
            creator: { connect: { id: user.id } },
        }
    });
    return learnsession;
}
export async function updateLearnSession(learnSession: learnSession) {
    const updatedSession = await prisma.learnSession.update({
        where: { id: learnSession.id },
        data: learnSession,
    });
    return updatedSession;
}
export async function getLearnSessionFromListAndUser(user: User, list: list) {
    const learnsession = await prisma.learnSession.findFirst({
        where: {
            creatorId: user.id,
            listId: list.id,
        }
    });
    return learnsession;
}