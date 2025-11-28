"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { eventApi, UpdateEventRequest, Event, uploadApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import Image from "next/image"

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState<UpdateEventRequest>({
    title: "",
    description: "",
    location: "",
    category: "Party",
    dateTime: "",
    quantity: 100,
    status: "drafted",
    image: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchEvent();
  }, [isAuthenticated, eventId, router]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      // Use getEventById for direct access (works for admin and owner)
      const response = await eventApi.getEventById(eventId);
      if (response.success && response.data?.event) {
        const foundEvent = response.data.event;
        setEvent(foundEvent);
        // Convert dateTime to local datetime-local format
        const date = new Date(foundEvent.dateTime);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        
        setFormData({
          title: foundEvent.title,
          description: foundEvent.description || "",
          location: foundEvent.location,
          category: foundEvent.category as any,
          dateTime: localDateTime,
          quantity: foundEvent.quantity,
          status: foundEvent.status as 'drafted' | 'published',
          image: foundEvent.image || "",
        });
        if (foundEvent.image) {
          setImagePreview(foundEvent.image);
        }
      } else {
        setError('Failed to load event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const processImageFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const response = await uploadApi.uploadImage(file);
      
      if (response.success && response.data?.imageUrl) {
        setFormData({ ...formData, image: response.data.imageUrl });
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Convert to ISO string
      const dateTime = formData.dateTime ? new Date(formData.dateTime).toISOString() : undefined;
      
      const updateData: UpdateEventRequest = {
        ...formData,
        dateTime,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
      };

      const response = await eventApi.updateEvent(eventId, updateData);
      
      if (response.success) {
        router.push("/profile");
      } else {
        setError(response.message || "Failed to update event");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12 text-center">
          <p className="text-gray-600">{loading ? "Loading event..." : "Redirecting..."}</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
              {error || "Event not found"}
            </div>
            <Button 
              onClick={() => router.push("/profile")}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Back to Profile
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Form Section */}
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Event</h1>
            <p className="text-gray-600">Update your event details</p>
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
              {/* Event Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold text-gray-900 mb-2 block">
                  Event Title *
                </Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Summer Music Festival" 
                  className="h-12 text-base"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>

              {/* Event Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold text-gray-900 mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about your event..."
                  rows={5}
                  className="text-base"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={saving}
                />
              </div>

              {/* Date and Time */}
              <div>
                <Label htmlFor="dateTime" className="text-base font-semibold text-gray-900 mb-2 block">
                  Date & Time *
                </Label>
                <Input 
                  id="dateTime" 
                  type="datetime-local" 
                  className="h-12 text-base"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-base font-semibold text-gray-900 mb-2 block">
                  Location *
                </Label>
                <Input 
                  id="location" 
                  placeholder="e.g., San Francisco, CA" 
                  className="h-12 text-base"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-base font-semibold text-gray-900 mb-2 block">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  disabled={saving}
                >
                  <SelectTrigger id="category" className="h-12 text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Party">Party</SelectItem>
                    <SelectItem value="Games">Games</SelectItem>
                    <SelectItem value="Traveling">Traveling</SelectItem>
                    <SelectItem value="Hiking">Hiking</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image" className="text-base font-semibold text-gray-900 mb-2 block">
                  Event Image
                </Label>
                
                {(imagePreview || formData.image) ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imagePreview || formData.image || ''}
                        alt="Event preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          setImagePreview(null);
                        }}
                        disabled={uploading || saving}
                        className="flex-1"
                      >
                        Remove Image
                      </Button>
                      <Label
                        htmlFor="image"
                        className="flex-1 cursor-pointer"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading || saving}
                          className="w-full"
                          asChild
                        >
                          <span>Change Image</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <Label
                    htmlFor="image"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                      isDragging
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className={`w-10 h-10 mb-3 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className={`mb-2 text-sm ${isDragging ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                        {isDragging ? (
                          <span>Drop image here</span>
                        ) : (
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </Label>
                )}
                
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await processImageFile(file);
                  }}
                  disabled={uploading || saving}
                  className="hidden"
                />
                
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <Label htmlFor="quantity" className="text-base font-semibold text-gray-900 mb-2 block">
                  Event Capacity *
                </Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  placeholder="e.g., 100" 
                  className="h-12 text-base"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min={1}
                  required
                  disabled={saving}
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className="text-base font-semibold text-gray-900 mb-2 block">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'drafted' | 'published') => setFormData({ ...formData, status: value })}
                  disabled={saving}
                >
                  <SelectTrigger id="status" className="h-12 text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drafted">Draft</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                  </SelectContent>
                </Select>
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

