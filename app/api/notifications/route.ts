import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/services/notificationService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";

// GET /api/notifications - Get notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await notificationService.getUserNotifications(
      profile.id,
      Math.min(limit, 100),
      unreadOnly
    );

    const unreadCount = await notificationService.getUnreadCount(profile.id);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);

    const body = await req.json();
    const { action, notificationId } = body;

    if (action === "mark_all_read") {
      await notificationService.markAllAsRead(profile.id);

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (action === "mark_read" && notificationId) {
      await notificationService.markAsRead(notificationId);

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Notifications update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);

    const { searchParams } = new URL(req.url);
    const notificationId = parseInt(searchParams.get("id") || "0");

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await notificationService.deleteNotification(notificationId);

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Notification deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete notification" },
      { status: 500 }
    );
  }
}
