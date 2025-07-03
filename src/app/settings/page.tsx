"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { databases, account } from "@/lib/appwrite/client";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/types";
import { Query } from "appwrite";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/layout/app-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      // Try to get profile from database
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal("user_id", user?.$id || "")]
      );

      let profileData = null;
      if (response.documents.length > 0) {
        profileData = response.documents[0];
      }

      setProfile({
        username: profileData?.username || user?.name || "",
        email: profileData?.email || user?.email || "",
      });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [user?.$id, user?.name, user?.email]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [user, fetchProfile, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Try to update existing profile or create new one
      const existingProfiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal("user_id", user?.$id || "")]
      );

      if (existingProfiles.documents.length > 0) {
        // Update existing profile
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          existingProfiles.documents[0].$id,
          {
            username: profile.username,
            email: profile.email,
          }
        );
      } else {
        // Create new profile
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          "unique()",
          {
            user_id: user?.$id,
            username: profile.username,
            email: profile.email,
          }
        );
      }

      setSuccess("Profile updated successfully!");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      setSaving(false);
      return;
    }

    try {
      await account.updatePassword(
        passwordData.newPassword,
        passwordData.currentPassword
      );

      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'This will permanently delete your account and all your contacts. Type "DELETE" to confirm:'
    );

    if (confirmation !== "DELETE") {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Delete all user data first
      const userContacts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTACTS,
        [Query.equal("user_id", user?.$id || "")]
      );

      for (const contact of userContacts.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.CONTACTS,
          contact.$id
        );
      }

      const userTags = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TAGS,
        [Query.equal("user_id", user?.$id || "")]
      );

      for (const tag of userTags.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TAGS, tag.$id);
      }

      // Delete user account
      await account.deleteSession("current");
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-brand-beige">
            Account Settings
          </h2>
          <p className="text-brand-pink">
            Manage your profile and account preferences.
          </p>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-md text-sm mb-6"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "rgb(239, 68, 68)",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="px-4 py-3 rounded-md text-sm mb-6"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              color: "rgb(34, 197, 94)",
            }}
          >
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={profile.username}
                    onChange={(value) =>
                      setProfile((prev) => ({
                        ...prev,
                        username: value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(value) =>
                      setProfile((prev) => ({ ...prev, email: value }))
                    }
                    disabled={saving}
                  />
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Changing your email will require verification.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    New Password
                  </label>
                  <PasswordInput
                    id="newPassword"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(value) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Confirm New Password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(value) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Overview of your account activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Account Created
                  </span>
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.$createdAt
                      ? new Date(user.$createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Last Sign In
                  </span>
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.$updatedAt
                      ? new Date(user.$updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download a copy of all your contact data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Export all your contacts and conversation history as a JSON
                file.
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const contacts = await databases.listDocuments(
                      DATABASE_ID,
                      COLLECTIONS.CONTACTS,
                      [Query.equal("user_id", user?.$id || "")]
                    );

                    const dataStr = JSON.stringify(contacts.documents, null, 2);
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `friendly-reminder-export-${
                      new Date().toISOString().split("T")[0]
                    }.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  } catch {
                    setError("Failed to export data");
                  }
                }}
              >
                Export My Data
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: "rgb(239, 68, 68)" }}>
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4
                    className="font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Delete Account
                  </h4>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting Account..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}
