"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Edit, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api-client";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    state: "",
    class_level: 0,
    target_degree: "",
    budget_min: 0,
    budget_max: 0,
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        state: "",
        class_level: 12,
        target_degree: "",
        budget_min: 0,
        budget_max: 1000000,
      });

      // Fetch additional user data from API
      const fetchUserData = async () => {
        try {
          const response = await apiClient.get("/auth/me/");
          if (response.data && response.data.user) {
            setProfileData({
              name: response.data.user.name || session.user.name || "",
              email: response.data.user.email || session.user.email || "",
              state: response.data.user.state || "",
              class_level: response.data.user.class_level || 12,
              target_degree: response.data.user.target_degree || "",
              budget_min: response.data.user.budget_min || 0,
              budget_max: response.data.user.budget_max || 1000000,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: name === "class_level" || name === "budget_min" || name === "budget_max"
        ? parseInt(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.put("/users/profile/", profileData);

      if (response.status === 200) {
        // Update session with new user data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: profileData.name,
          },
        });

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });

        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = profileData.name
    ? profileData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "U";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6 font-[var(--font-space-grotesk)]">
          Your Profile
        </h1>

        <Card className="mb-8">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center justify-between">
              <span>Personal Information</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
              >
                {isEditing ? (
                  <>
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={session?.user?.image || ""} alt={profileData.name} />
                    <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                  </Avatar>
                  {!isEditing && (
                    <div className="text-sm text-muted-foreground">
                      {session?.user?.email}
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="name"
                          value={profileData.name}
                          onChange={handleChange}
                          className="pl-10"
                          disabled={!isEditing || isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          className="pl-10"
                          disabled={true}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        name="state"
                        value={profileData.state}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        placeholder="e.g. California"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class Level</label>
                      <Input
                        name="class_level"
                        type="number"
                        min="9"
                        max="12"
                        value={profileData.class_level}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Degree</label>
                      <Input
                        name="target_degree"
                        value={profileData.target_degree}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        placeholder="e.g. Computer Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Budget Range (Annual)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          name="budget_min"
                          type="number"
                          min="0"
                          value={profileData.budget_min}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          placeholder="Min"
                        />
                        <span>to</span>
                        <Input
                          name="budget_max"
                          type="number"
                          min="0"
                          value={profileData.budget_max}
                          onChange={handleChange}
                          disabled={!isEditing || isLoading}
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
