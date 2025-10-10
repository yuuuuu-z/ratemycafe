"use client";
import { useEffect, useState } from "react";
import type React from "react";

import { createSupabaseBrowser } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Cafe {
  id: string;
  name: string;
  description: string;
  image_url: string;
  location: string;
  gallery_urls: string[]; // Add this field
}

interface StorageFile {
  name: string;
  id: string;
  url: string;
}

export default function AdminPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<StorageFile[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [selectedCafeForGallery, setSelectedCafeForGallery] = useState<
    string | null
  >(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const supabase = createSupabaseBrowser();

  const [newCafe, setNewCafe] = useState({
    name: "",
    description: "",
    image_url: "",
    location: "",
  });

  // fetch cafes
  async function fetchCafes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cafes")
        .select("id, name, description, image_url, location, gallery_urls") // Add gallery_urls
        .order("id", { ascending: true });

      if (error) {
        setError(`Failed to fetch cafes: ${error.message}`);
        console.error(error);
      } else {
        setCafes(data || []);
        setError(null);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching cafes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // list gallery images for a cafe from storage
  async function fetchGalleryImages(cafeName: string) {
    try {
      // Convert cafe name to folder name format (lowercase, hyphenated)
      const folderName = cafeName.toLowerCase().replace(/\s+/g, "-");

      const { data, error } = await supabase.storage
        .from("cafe-images")
        .list(folderName);

      if (error) {
        console.error("Error listing gallery images:", error);
        setGalleryFiles([]);
        return;
      }

      // Generate public URLs for each file
      const filesWithUrls = data.map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("cafe-images")
          .getPublicUrl(`${folderName}/${file.name}`);

        return {
          name: file.name,
          id: file.id,
          url: publicUrl,
        };
      });

      setGalleryFiles(filesWithUrls);
    } catch (err) {
      console.error("Error fetching gallery images:", err);
      setGalleryFiles([]);
    }
  }

  // upload image to Supabase Storage
  async function uploadImage(file: File, folderName: string) {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const fullPath = `${folderName}/${fileName}`;

      const { error } = await supabase.storage
        .from("cafe-images")
        .upload(fullPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error details:", error);
        // Check if it's an RLS policy violation
        if (
          error.message.includes("row-level security policy") ||
          error.message.includes("policy")
        ) {
          throw new Error(
            "Storage upload permission denied. Please check your Supabase storage policies for the 'cafe-images' bucket."
          );
        } else {
          throw new Error(`Failed to upload image: ${error.message}`);
        }
      }

      // get public URL
      const { data: publicUrl } = supabase.storage
        .from("cafe-images")
        .getPublicUrl(fullPath);

      return publicUrl.publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  }

  // create new cafe
  async function addCafe() {
    if (!newCafe.name.trim()) {
      setError("Cafe name is required");
      return;
    }

    if (!logoFile && !newCafe.image_url.trim()) {
      setError(
        "Logo image is required (either upload a file or provide a URL)"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let logoUrl = newCafe.image_url.trim();

      // Upload logo file if one is selected
      if (logoFile) {
        setLogoUploading(true);
        try {
          const folderName = "logos";
          logoUrl = await uploadImage(logoFile, folderName);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to upload logo"
          );
          return;
        } finally {
          setLogoUploading(false);
        }
      }

      const { error } = await supabase.from("cafes").insert([
        {
          name: newCafe.name.trim(),
          description: newCafe.description.trim(),
          image_url: logoUrl,
          location: newCafe.location.trim(),
          gallery_urls: [], // Initialize empty array
        },
      ]);

      if (error) {
        if (error.message.includes("row-level security policy")) {
          setError(
            "Permission denied. Please check your Supabase RLS policies."
          );
        } else {
          setError(`Failed to create cafe: ${error.message}`);
        }
        console.error(error);
        return;
      }

      setSuccess("Cafe created successfully!");
      setNewCafe({ name: "", description: "", image_url: "", location: "" });
      setLogoFile(null);
      fetchCafes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create cafe");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // update cafe
  async function updateCafe(cafe: Cafe) {
    try {
      setIsSubmitting(true);
      setError(null);

      let logoUrl = newCafe.image_url.trim() || cafe.image_url;

      // Upload logo file if one is selected
      if (logoFile) {
        setLogoUploading(true);
        try {
          const folderName = "logos";
          logoUrl = await uploadImage(logoFile, folderName);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to upload logo"
          );
          return;
        } finally {
          setLogoUploading(false);
        }
      }

      const { error } = await supabase
        .from("cafes")
        .update({
          name: newCafe.name.trim() || cafe.name,
          description: newCafe.description.trim() || cafe.description,
          image_url: logoUrl,
          location: newCafe.location.trim() || cafe.location,
        })
        .eq("id", cafe.id);

      if (error) {
        if (error.message.includes("row-level security policy")) {
          setError(
            "Permission denied. Please check your Supabase RLS policies."
          );
        } else {
          setError(`Failed to update cafe: ${error.message}`);
        }
        console.error(error);
        return;
      }

      setSuccess("Cafe updated successfully!");
      setEditingCafe(null);
      setNewCafe({ name: "", description: "", image_url: "", location: "" });
      setLogoFile(null);
      fetchCafes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cafe");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // delete cafe
  async function deleteCafe(id: string) {
    if (!confirm("Are you sure you want to delete this cafe?")) return;

    try {
      setError(null);
      const { error } = await supabase.from("cafes").delete().eq("id", id);

      if (error) {
        if (error.message.includes("row-level security policy")) {
          setError(
            "Permission denied. Please check your Supabase RLS policies."
          );
        } else {
          setError(`Failed to delete cafe: ${error.message}`);
        }
        console.error(error);
        return;
      }

      setSuccess("Cafe deleted successfully!");
      fetchCafes();
    } catch (err) {
      setError("Failed to delete cafe");
      console.error(err);
    }
  }

  // upload gallery images and update the database
  async function uploadGalleryImages() {
    if (!selectedCafeForGallery || selectedFiles.length === 0) return;

    try {
      setGalleryUploading(true);
      const cafe = cafes.find((c) => c.id === selectedCafeForGallery);
      if (!cafe) return;

      const folderName = cafe.name.toLowerCase().replace(/\s+/g, "-");
      const uploadedUrls: string[] = [];

      // Upload all selected files
      for (const file of selectedFiles) {
        try {
          const imageUrl = await uploadImage(file, folderName);
          uploadedUrls.push(imageUrl);
        } catch (err) {
          console.error(`Failed to upload file ${file.name}:`, err);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error("No images were successfully uploaded");
      }

      // Update the cafe's gallery_urls in the database
      const currentGalleryUrls = cafe.gallery_urls || [];
      const updatedGalleryUrls = [...currentGalleryUrls, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from("cafes")
        .update({ gallery_urls: updatedGalleryUrls })
        .eq("id", cafe.id);

      if (updateError) {
        throw new Error(
          `Failed to update gallery URLs: ${updateError.message}`
        );
      }

      setSuccess(
        `${uploadedUrls.length} gallery image(s) uploaded successfully!`
      );
      fetchGalleryImages(cafe.name);
      fetchCafes(); // Refresh the cafes to get updated gallery_urls
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
      console.error(err);
    } finally {
      setGalleryUploading(false);
    }
  }

  // delete gallery image and update the database
  async function deleteGalleryImage(fileName: string, cafeName: string) {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const cafe = cafes.find((c) => c.name === cafeName);
      if (!cafe) return;

      // Convert cafe name to folder name format (lowercase, hyphenated)
      const folderName = cafe.name.toLowerCase().replace(/\s+/g, "-");
      const filePath = `${folderName}/${fileName}`;

      const { error } = await supabase.storage
        .from("cafe-images")
        .remove([filePath]);

      if (error) {
        // Check if it's an RLS policy violation
        if (
          error.message.includes("row-level security policy") ||
          error.message.includes("policy")
        ) {
          setError(
            "Storage delete permission denied. Please check your Supabase storage policies."
          );
        } else {
          setError(`Failed to delete gallery image: ${error.message}`);
        }
        console.error(error);
        return;
      }

      // Remove the URL from the cafe's gallery_urls in the database
      const { data: publicUrlData } = supabase.storage
        .from("cafe-images")
        .getPublicUrl(filePath);

      const urlToRemove = publicUrlData.publicUrl;
      const updatedGalleryUrls = (cafe.gallery_urls || []).filter(
        (url) => url !== urlToRemove
      );

      const { error: updateError } = await supabase
        .from("cafes")
        .update({ gallery_urls: updatedGalleryUrls })
        .eq("id", cafe.id);

      if (updateError) {
        throw new Error(
          `Failed to update gallery URLs: ${updateError.message}`
        );
      }

      setSuccess("Gallery image deleted successfully!");
      fetchGalleryImages(cafeName);
      fetchCafes(); // Refresh the cafes to get updated gallery_urls
    } catch (err) {
      setError("Failed to delete gallery image");
      console.error(err);
    }
  }

  // open gallery manager for a cafe
  function openGalleryManager(cafeId: string, cafeName: string) {
    setSelectedCafeForGallery(cafeId);
    fetchGalleryImages(cafeName);
    setShowGalleryModal(true);
  }

  // handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  }

  function handleLogoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      // Clear any existing image_url when a file is selected
      setNewCafe({ ...newCafe, image_url: "" });
    }
  }

  // start editing a cafe
  function startEdit(cafe: Cafe) {
    setEditingCafe(cafe);
    setNewCafe({
      name: cafe.name,
      description: cafe.description,
      image_url: cafe.image_url,
      location: cafe.location,
    });
    setLogoFile(null);
  }

  // cancel editing
  function cancelEdit() {
    setEditingCafe(null);
    setNewCafe({ name: "", description: "", image_url: "", location: "" });
    setLogoFile(null);
    setError(null);
  }

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setError("You must be logged in to access the admin panel");
        setLoading(false);
        return;
      }

      fetchCafes();
    };

    checkUser();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl mb-4">Access Denied</CardTitle>
            <CardDescription className="text-destructive mb-8 text-base">
              You must be logged in to access the admin panel.
            </CardDescription>
            <Button asChild size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-4xl mb-2">
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription className="text-base">
                    Manage your cafe listings and gallery
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertDescription className="flex justify-between items-center">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertDescription className="flex justify-between items-center text-green-800">
                <span>{success}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(null)}
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                {editingCafe ? "Edit Cafe" : "Add New Cafe"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2">
                  <Label htmlFor="name">Cafe Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter cafe name"
                    value={newCafe.name}
                    onChange={(e) =>
                      setNewCafe({ ...newCafe, name: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter cafe location"
                    value={newCafe.location}
                    onChange={(e) =>
                      setNewCafe({ ...newCafe, location: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter cafe description"
                    rows={3}
                    value={newCafe.description}
                    onChange={(e) =>
                      setNewCafe({ ...newCafe, description: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Label>Logo Image *</Label>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="logo_file"
                        className="text-sm font-medium"
                      >
                        Upload Logo Image
                      </Label>
                      <Input
                        id="logo_file"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        disabled={isSubmitting || logoUploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {logoFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Selected: {logoFile.name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>

                    {/* <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-sm font-medium">
                      Logo Image URL (optional)
                    </Label>
                    <Input
                      id="image_url"
                      placeholder="Enter logo image URL"
                      value={newCafe.image_url}
                      onChange={(e) =>
                        setNewCafe({ ...newCafe, image_url: e.target.value })
                      }
                      disabled={isSubmitting || !!logoFile}
                    />
                    {logoFile && (
                      <p className="text-xs text-muted-foreground">
                        URL input is disabled when a file is selected
                      </p>
                    )}
                  </div> */}
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-3 pt-4">
                  {editingCafe ? (
                    <>
                      <Button
                        onClick={() => updateCafe(editingCafe)}
                        disabled={isSubmitting || logoUploading}
                        size="lg"
                      >
                        {isSubmitting || logoUploading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {logoUploading
                              ? "Uploading Logo..."
                              : "Updating..."}
                          </>
                        ) : (
                          "Update Cafe"
                        )}
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        disabled={isSubmitting || logoUploading}
                        variant="secondary"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={addCafe}
                      disabled={isSubmitting || logoUploading}
                      size="lg"
                    >
                      {isSubmitting || logoUploading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {logoUploading ? "Uploading Logo..." : "Adding..."}
                        </>
                      ) : (
                        "Add Cafe"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-secondary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                All Cafes Lists ({cafes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {cafes.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl mb-2">No cafes found</CardTitle>
                  <CardDescription>
                    Add your first cafe above to get started!
                  </CardDescription>
                </div>
              ) : (
                <>
                  <div className="border-b">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="w-12"></TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Name
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Location
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Gallery
                          </TableHead>
                          <TableHead className="font-semibold text-foreground ">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cafes.map((cafe) => (
                          <TableRow
                            key={cafe.id}
                            className="hover:bg-muted/50 border-b border-border/40"
                          >
                            <TableCell className="w-12">
                              <div className="flex items-center justify-center text-muted-foreground cursor-grab hover:text-foreground transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="9" cy="12" r="1" />
                                  <circle cx="9" cy="5" r="1" />
                                  <circle cx="9" cy="19" r="1" />
                                  <circle cx="15" cy="12" r="1" />
                                  <circle cx="15" cy="5" r="1" />
                                  <circle cx="15" cy="19" r="1" />
                                </svg>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Image
                                  src={cafe.image_url || "/placeholder.svg"}
                                  alt={cafe.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 object-cover rounded-lg border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-image.png";
                                  }}
                                />
                                <div>
                                  <div className="font-medium text-foreground">
                                    {cafe.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                    {cafe.description || "No description"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge>{cafe.location || "No location"}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Verified
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="h-5 min-w-5 bg-blue-500 rounded-full px-1 ml-3 font-mono tabular-nums">
                                <span className="">
                                  {cafe.gallery_urls?.length || 0}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => startEdit(cafe)}
                                  disabled={isSubmitting}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  onClick={() =>
                                    openGalleryManager(cafe.id, cafe.name)
                                  }
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  onClick={() => deleteCafe(cafe.id)}
                                  disabled={isSubmitting}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>0 of {cafes.length} row(s) selected.</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Rows per page
                      </span>
                      <select className="border border-border rounded px-2 py-1 text-sm bg-background">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Page 1 of 1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div> */}
                </>
              )}
            </CardContent>
          </Card>

          <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  Manage Gallery
                </DialogTitle>
              </DialogHeader>

              <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Upload Gallery Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={galleryUploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {selectedFiles.length > 0 && (
                        <Card>
                          <CardContent className="pt-4">
                            <p className="text-sm font-semibold mb-2">
                              Selected {selectedFiles.length} file(s)
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {selectedFiles.map((file, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  {file.name}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                      <Button
                        onClick={uploadGalleryImages}
                        disabled={
                          selectedFiles.length === 0 || galleryUploading
                        }
                        size="lg"
                      >
                        {galleryUploading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          `Upload ${selectedFiles.length} File(s)`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="relative overflow-hidden rounded-lg border">
                        <Image
                          src={file.url || "/placeholder.svg"}
                          alt="Gallery image"
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Button
                            onClick={() => {
                              const cafe = cafes.find(
                                (c) => c.id === selectedCafeForGallery
                              );
                              if (cafe) {
                                deleteGalleryImage(file.name, cafe.name);
                              }
                            }}
                            size="sm"
                            variant="destructive"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {galleryFiles.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-12 h-12 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <CardTitle className="text-xl mb-2">
                      No gallery images yet
                    </CardTitle>
                    <CardDescription>
                      Upload some images to get started!
                    </CardDescription>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
}
