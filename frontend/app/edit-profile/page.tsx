"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UpdateProfileRequest } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const updateData: UpdateProfileRequest = {
        name: formData.name,
        phone: formData.phone || undefined,
      };

      await updateProfile(updateData);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12 text-center">
          <p className="text-gray-600">{loading ? "Loading profile..." : "Redirecting..."}</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Form Section */}
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your profile information</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email (Read-only) */}
              <div>
                <Label htmlFor="email" className="text-base font-semibold text-gray-900 mb-2 block">
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={user.email}
                  className="h-12 text-base bg-gray-50"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-base font-semibold text-gray-900 mb-2 block">
                  Full Name *
                </Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  className="h-12 text-base"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-base font-semibold text-gray-900 mb-2 block">
                  Phone Number
                </Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="+1 (555) 123-4567" 
                  className="h-12 text-base"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={saving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base bg-transparent"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold disabled:bg-orange-300"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

