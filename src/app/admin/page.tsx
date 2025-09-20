"use client";
import { useEffect, useState } from "react";
import { createClientSupabase } from "@/utils/supabase/client";
import Image from "next/image";

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

  const supabase = createClientSupabase();

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

    if (!newCafe.image_url.trim()) {
      setError("Logo Image URL is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { error } = await supabase.from("cafes").insert([
        {
          name: newCafe.name.trim(),
          description: newCafe.description.trim(),
          image_url: newCafe.image_url.trim(),
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

      const { error } = await supabase
        .from("cafes")
        .update({
          name: newCafe.name.trim() || cafe.name,
          description: newCafe.description.trim() || cafe.description,
          image_url: newCafe.image_url.trim() || cafe.image_url,
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

  // start editing a cafe
  function startEdit(cafe: Cafe) {
    setEditingCafe(cafe);
    setNewCafe({
      name: cafe.name,
      description: cafe.description,
      image_url: cafe.image_url,
      location: cafe.location,
    });
  }

  // cancel editing
  function cancelEdit() {
    setEditingCafe(null);
    setNewCafe({ name: "", description: "", image_url: "", location: "" });
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

  if (loading) return <p className="p-6">Loading...</p>;

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-red-600 mb-4">
            You must be logged in to access the admin panel.
          </p>
          <a
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user.email}</span>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
          <button
            className="float-right font-bold"
            onClick={() => setSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Add/Edit Cafe Form */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {editingCafe ? "Edit Cafe" : "Add New Cafe"}
        </h2>
        <div className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cafe Name *
            </label>
            <input
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter cafe name"
              value={newCafe.name}
              onChange={(e) => setNewCafe({ ...newCafe, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter cafe description"
              rows={3}
              value={newCafe.description}
              onChange={(e) =>
                setNewCafe({ ...newCafe, description: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter cafe location"
              value={newCafe.location}
              onChange={(e) =>
                setNewCafe({ ...newCafe, location: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo Image URL *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter logo image URL"
              value={newCafe.image_url}
              onChange={(e) =>
                setNewCafe({ ...newCafe, image_url: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-2">
            {editingCafe ? (
              <>
                <button
                  onClick={() => updateCafe(editingCafe)}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Cafe"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={addCafe}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Cafe"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cafes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">
          Cafes ({cafes.length})
        </h2>
        {cafes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No cafes found. Add your first cafe above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gallery Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cafes.map((cafe) => (
                  <tr key={cafe.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Image
                        src={cafe.image_url}
                        alt={cafe.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.png";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cafe.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {cafe.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {cafe.location || "No location"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {cafe.gallery_urls?.length || 0} images
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(cafe)}
                            disabled={isSubmitting}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCafe(cafe.id)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                        <button
                          onClick={() => openGalleryManager(cafe.id, cafe.name)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Manage Gallery
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && selectedCafeForGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Gallery</h2>
              <button
                onClick={() => {
                  setShowGalleryModal(false);
                  setSelectedFiles([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gallery Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={galleryUploading}
                className="w-full border border-gray-300 p-2 rounded-md mb-2"
              />
              {selectedFiles.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Selected {selectedFiles.length} file(s)
                  </p>
                  <ul className="text-xs text-gray-500 mt-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={uploadGalleryImages}
                disabled={selectedFiles.length === 0 || galleryUploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {galleryUploading
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} File(s)`}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <Image
                    src={file.url}
                    alt="Gallery image"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const cafe = cafes.find(
                        (c) => c.id === selectedCafeForGallery
                      );
                      if (cafe) {
                        deleteGalleryImage(file.name, cafe.name);
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {galleryFiles.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No gallery images yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
