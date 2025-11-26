const { Message, User } = require('../models');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    const senderId = req.user.id;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      content,
      type
    };

    // Generate conversationId manually since default() doesn't work
    const ids = [senderId.toString(), receiverId.toString()].sort();
    messageData.conversationId = `${ids[0]}-${ids[1]}`;

    const message = new Message(messageData);
    await message.save();

    // Also create notification for receiver
    const { createNotification } = require('./notificationController');
    await createNotification(
      receiverId,
      'New Message',
      `You have received a new message from ${req.user.username}`,
      { messageId: message._id, senderId },
      false // Don't send email for every message
    );

    res.status(201).json(await message.populate(['sender', 'receiver']));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Generate conversationId
    const ids = [currentUserId.toString(), userId.toString()].sort();
    const conversationId = `${ids[0]}-${ids[1]}`;

    const messages = await Message.find({ conversationId })
      .populate(['sender', 'receiver'])
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all conversationIds for this user
    const conversationIds = await Message.distinct('conversationId', {
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    });

    // For each conversation, get the last message and other participant's info
    const conversations = [];
    for (const conversationId of conversationIds) {
      const lastMessage = await Message.findOne({ conversationId })
        .populate(['sender', 'receiver'])
        .sort({ createdAt: -1 })
        .limit(1);

      if (lastMessage) {
        // Get the other participant
        const otherParticipant = lastMessage.sender._id.toString() === currentUserId
          ? lastMessage.receiver
          : lastMessage.sender;

        conversations.push({
          conversationId,
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.createdAt,
          unreadCount: await Message.countDocuments({
            conversationId,
            receiver: currentUserId,
            read: false
          }),
          participant: otherParticipant
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Generate conversationId
    const ids = [currentUserId.toString(), userId.toString()].sort();
    const conversationId = `${ids[0]}-${ids[1]}`;

    await Message.updateMany(
      { conversationId, receiver: currentUserId, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
