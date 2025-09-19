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
}

export default function AdminPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);

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
        .select("id, name, description, image_url, location")
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

  // create new cafe
  async function addCafe() {
    if (!newCafe.name.trim()) {
      setError("Cafe name is required");
      return;
    }

    if (!newCafe.image_url.trim()) {
      setError("Image URL is required");
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
        },
      ]);

      if (error) {
        // Check if it's an RLS policy violation
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
        // Check if it's an RLS policy violation
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
        // Check if it's an RLS policy violation
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
          {/* <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
          >
            Sign Out
          </button> */}
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
              Image URL *
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter image URL"
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
                    Image
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
