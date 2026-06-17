-- Migration: 0019_chat_system.sql
-- Description: Add bidirectional chat system with WhatsApp integration
-- Created: 2026-06-14

-- ============================================
-- CHAT CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,

    -- Participants
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES profiles(id) ON DELETE SET NULL,

    -- Conversation metadata
    status VARCHAR(20) DEFAULT 'open', -- open, resolved, closed, archived
    source VARCHAR(20) DEFAULT 'web', -- web, whatsapp, email
    channel_id VARCHAR(100), -- WhatsApp phone number or email address

    -- Subject and category
    subject VARCHAR(255),
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent

    -- SLA tracking
    sla_breach BOOLEAN DEFAULT false,
    sla_breach_reason TEXT,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,

    -- Analytics
    message_count INTEGER DEFAULT 0,
    unread_agent_messages INTEGER DEFAULT 0,
    unread_client_messages INTEGER DEFAULT 0,
    last_message_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT NOW(),

    -- WhatsApp sync
    whatsapp_phone VARCHAR(20),
    whatsapp_conversation_id VARCHAR(100),
    last_whatsapp_sync TIMESTAMP,

    -- Metadata
    tags JSONB,
    metadata JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for chat conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client ON chat_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned ON chat_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_source ON chat_conversations(source);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_channel ON chat_conversations(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_whatsapp ON chat_conversations(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_activity ON chat_conversations(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_unread ON chat_conversations(assigned_to) WHERE unread_agent_messages > 0;

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,

    -- Conversation reference
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,

    -- Sender information
    sender_id VARCHAR(255), -- Can be user_id or phone number
    sender_type VARCHAR(20) NOT NULL, -- client, agent, system, bot
    sender_name VARCHAR(255),

    -- Message content
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, video, audio, file, system
    media_url TEXT,
    media_name VARCHAR(255),
    media_size INTEGER,
    media_mime_type VARCHAR(100),

    -- WhatsApp integration
    whatsapp_message_id VARCHAR(100),
    whatsapp_status VARCHAR(50), -- sent, delivered, read, failed
    whatsapp_error_message TEXT,

    -- Message status
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    reply_to_id INTEGER REFERENCES chat_messages(id),

    -- Read receipts
    read_at TIMESTAMP,
    delivered_at TIMESTAMP,

    -- Reactions
    reactions JSONB,

    -- System messages
    is_system_message BOOLEAN DEFAULT false,
    system_message_type VARCHAR(50), -- conversation_created, assigned, status_changed, etc.

    -- AI and analytics
    ai_sentiment VARCHAR(20),
    ai_category VARCHAR(100),
    ai_suggested_reply TEXT,

    -- Metadata
    metadata JSONB,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(conversation_id) WHERE read_at IS NULL AND is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_chat_messages_whatsapp ON chat_messages(whatsapp_message_id);

-- ============================================
-- CHAT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_attachments (
    id SERIAL PRIMARY KEY,

    -- Reference
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,

    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),

    -- Cloudinary info
    cloudinary_public_id VARCHAR(255),
    cloudinary_version INTEGER,

    -- Upload info
    uploaded_by VARCHAR(255),
    upload_source VARCHAR(20) DEFAULT 'web', -- web, whatsapp, email

    -- Processing
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    thumbnail_url TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for chat attachments
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_conversation ON chat_attachments(conversation_id);

-- ============================================
-- CHAT TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_templates (
    id SERIAL PRIMARY KEY,

    -- Template details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags JSONB,

    -- Template content
    content TEXT NOT NULL,
    variables JSONB, -- Array of variable names to replace

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,

    -- Access control
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES profiles(id),
    role_access JSONB, -- Roles that can use this template

    -- WhatsApp template
    is_whatsapp_template BOOLEAN DEFAULT false,
    whatsapp_template_name VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for chat templates
CREATE INDEX IF NOT EXISTS idx_chat_templates_category ON chat_templates(category);
CREATE INDEX IF NOT EXISTS idx_chat_templates_active ON chat_templates(is_active);

-- ============================================
-- CHAT ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_activity_log (
    id SERIAL PRIMARY KEY,

    -- Reference
    conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    user_id VARCHAR(255),

    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- message_sent, message_read, typing_started, typing_stopped, conversation_opened, etc.
    activity_details JSONB,

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for chat activity log
CREATE INDEX IF NOT EXISTS idx_chat_activity_conversation ON chat_activity_log(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_activity_user ON chat_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_activity_type ON chat_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_chat_activity_created ON chat_activity_log(created_at);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update conversation stats when message is added
CREATE OR REPLACE FUNCTION update_conversation_message_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message count
    UPDATE chat_conversations
    SET
        message_count = message_count + 1,
        last_message_at = NOW(),
        last_activity_at = NOW()
    WHERE id = NEW.conversation_id;

    -- Update unread count based on sender
    IF NEW.sender_type = 'client' THEN
        UPDATE chat_conversations
        SET unread_agent_messages = unread_agent_messages + 1
        WHERE id = NEW.conversation_id;
    ELSIF NEW.sender_type = 'agent' THEN
        UPDATE chat_conversations
        SET unread_client_messages = unread_client_messages + 1
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update conversation stats
CREATE TRIGGER update_stats_on_new_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_message_stats();

-- Function to update unread counts when message is read
CREATE OR REPLACE FUNCTION update_message_read_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message read timestamp
    UPDATE chat_messages
    SET read_at = NOW()
    WHERE id = NEW.message_id;

    -- Update conversation unread counts
    IF NEW.sender_type = 'agent' THEN
        UPDATE chat_conversations
        SET unread_client_messages = GREATEST(0, unread_client_messages - 1)
        WHERE id = (SELECT conversation_id FROM chat_messages WHERE id = NEW.message_id);
    ELSIF NEW.sender_type = 'client' THEN
        UPDATE chat_conversations
        SET unread_agent_messages = GREATEST(0, unread_agent_messages - 1)
        WHERE id = (SELECT conversation_id FROM chat_messages WHERE id = NEW.message_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATED AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to conversations table
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to templates table
CREATE TRIGGER update_chat_templates_updated_at
BEFORE UPDATE ON chat_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE chat_conversations IS 'Bidirectional chat conversations with WhatsApp integration';
COMMENT ON TABLE chat_messages IS 'Individual messages within conversations';
COMMENT ON TABLE chat_attachments IS 'File attachments for chat messages';
COMMENT ON TABLE chat_templates IS 'Canned response templates for quick replies';
COMMENT ON TABLE chat_activity_log IS 'Activity tracking for analytics and typing indicators';

COMMENT ON COLUMN chat_conversations.channel_id IS 'Unique identifier for external channel (WhatsApp phone, email, etc.)';
COMMENT ON COLUMN chat_conversations.whatsapp_phone IS 'Phone number for WhatsApp integration with country code';
COMMENT ON COLUMN chat_messages.whatsapp_message_id IS 'Message ID from WhatsApp API for sync';
COMMENT ON COLUMN chat_messages.sender_type IS 'Type of sender: client, agent, system, or bot';

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample chat templates
INSERT INTO chat_templates (name, description, category, content, variables, is_active)
VALUES
    ('Greeting', 'Welcome message for new conversations', 'greeting', 'Hello {{name}}! Welcome to Innovate Bhutan support. How can we help you today?', '["name"]', true),
    ('Ticket Created', 'Confirmation when ticket is created', 'ticket', 'Your ticket #{{ticket_id}} has been created successfully. Our team will respond within {{response_time}}.', '["ticket_id", "response_time"]', true),
    ('Resolution Offered', 'When solution is provided', 'resolution', 'We have a solution for your issue. Please try {{solution}}. Let us know if this helps!', '["solution"]', true),
    ('Follow-up', 'Follow up on resolved issue', 'follow-up', 'Just following up on your recent issue. Is everything working as expected?', '[]', true)
ON CONFLICT DO NOTHING;

-- Insert sample conversation (if tables are empty)
INSERT INTO chat_conversations (client_id, subject, status, source, priority)
SELECT
    1,
    'POS System Setup Support',
    'open',
    'web',
    'normal'
WHERE EXISTS (SELECT 1 FROM clients WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM chat_conversations LIMIT 1);

-- Insert sample message
INSERT INTO chat_messages (conversation_id, sender_id, sender_type, sender_name, message, message_type)
SELECT
    (SELECT id FROM chat_conversations WHERE client_id = 1 LIMIT 1),
    'client-1',
    'client',
    'Test Client',
    'Hello, I need help setting up my new POS system.',
    'text'
WHERE EXISTS (SELECT 1 FROM chat_conversations WHERE client_id = 1)
AND NOT EXISTS (SELECT 1 FROM chat_messages LIMIT 1);
