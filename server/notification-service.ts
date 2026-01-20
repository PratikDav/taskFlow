import { storage } from "./storage";

export class NotificationService {
  // Friend request notifications
  static async createFriendRequestNotification(recipientId: number, senderId: number, senderName: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "friend_request",
      title: "New Link Up Request",
      message: `${senderName} sent you a link up request.`,
      data: { senderId, senderName },
      is_read: false
    });
  }

  static async createFriendRequestAcceptedNotification(recipientId: number, accepterName: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "friend_request_accepted",
      title: "Link Up Request Accepted",
      message: `${accepterName} accepted your link up request!`,
      data: { accepterName },
      is_read: false
    });
  }

  static async createFriendRequestRejectedNotification(recipientId: number, rejecterName: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "friend_request_rejected",
      title: "Link Up Request Declined",
      message: `${rejecterName} declined your link up request.`,
      data: { rejecterName },
      is_read: false
    });
  }

  // Admin notifications
  static async createAdminPostNotification(recipientIds: number[], adminName: string, postTitle: string) {
    const notifications = recipientIds.map(recipientId =>
      storage.createNotification({
        user_id: recipientId,
        type: "admin_post",
        title: "New Admin Post",
        message: `${adminName} published a new post: "${postTitle}"`,
        data: { adminName, postTitle },
        is_read: false
      })
    );
    await Promise.all(notifications);
  }

  static async createAdminAnnouncementNotification(recipientIds: number[], adminName: string, announcement: string) {
    const notifications = recipientIds.map(recipientId =>
      storage.createNotification({
        user_id: recipientId,
        type: "admin_announcement",
        title: "Important Announcement",
        message: `${adminName}: ${announcement}`,
        data: { adminName, announcement },
        is_read: false
      })
    );
    await Promise.all(notifications);
  }

  // Friend post notifications
  static async createFriendPostNotification(recipientIds: number[], friendName: string, postTitle: string) {
    const notifications = recipientIds.map(recipientId =>
      storage.createNotification({
        user_id: recipientId,
        type: "friend_post",
        title: "New Post from Link Up",
        message: `${friendName} shared a new post: "${postTitle}"`,
        data: { friendName, postTitle },
        is_read: false
      })
    );
    await Promise.all(notifications);
  }

  // Mention notifications
  static async createMentionNotification(recipientId: number, mentionerName: string, postTitle: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "mention",
      title: "You were mentioned",
      message: `${mentionerName} mentioned you in "${postTitle}"`,
      data: { mentionerName, postTitle },
      is_read: false
    });
  }

  // Comment notifications
  static async createCommentNotification(recipientId: number, commenterName: string, postTitle: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "comment",
      title: "New Comment",
      message: `${commenterName} commented on your post "${postTitle}"`,
      data: { commenterName, postTitle },
      is_read: false
    });
  }

  // Reaction notifications
  static async createReactionNotification(recipientId: number, reactorName: string, postTitle: string, reactionType: string) {
    await storage.createNotification({
      user_id: recipientId,
      type: "reaction",
      title: "New Reaction",
      message: `${reactorName} reacted ${reactionType} to your post "${postTitle}"`,
      data: { reactorName, postTitle, reactionType },
      is_read: false
    });
  }

  // System notifications
  static async createSystemNotification(recipientIds: number[], title: string, message: string) {
    const notifications = recipientIds.map(recipientId =>
      storage.createNotification({
        user_id: recipientId,
        type: "system",
        title,
        message,
        data: { title, message },
        is_read: false
      })
    );
    await Promise.all(notifications);
  }

  // Helper method to get all user IDs (for broadcasts)
  static async getAllUserIds(): Promise<number[]> {
    // This would need to be implemented in storage
    // For now, return empty array - will be implemented when needed
    return [];
  }

  // Helper method to get friend IDs for a user
  static async getFriendIds(userId: number): Promise<number[]> {
    const friends = await storage.getFriends(userId);
    return friends.map(friend => friend.id);
  }
}