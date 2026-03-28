-- CreateIndex
CREATE INDEX "Message_receiverId_senderId_timestamp_idx" ON "Message"("receiverId", "senderId", "timestamp");
