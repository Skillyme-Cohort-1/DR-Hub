import { useState, useEffect } from "react";
import { getStoredAccessToken } from "../lib/auth";
import { BACKEND_URL } from "../../services/constants";

const EMPTY_PROFILE = {
  id: "",
  name: "",
  email: "",
  phoneNumber: "",
  gender: "",
  address: "",
  city: "",
  country: "",
  occupation: "",
  status: "",
  role: "",
  createdAt: "",
  updatedAt: "",
};

const FALLBACK_PROFILE = {
  ...EMPTY_PROFILE,
  id: "error-id",
  name: "User",
  status: "ACTIVE",
  role: "MEMBER",
};

export function useProfile() {
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const token = getStoredAccessToken();

      if (!token) {
        setProfileForm({
          ...FALLBACK_PROFILE,
          id: "mock-id",
          name: "John Doe",
          email: "john.doe@example.com",
          phoneNumber: "+254745491094",
          gender: "MALE",
          occupation: "Divorce Lawyer",
        });
        setProfileLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      if (data.user) {
        setProfileForm({
          id: data.user.id || "",
          name: data.user.name || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || "",
          gender: data.user.gender || "",
          address: data.user.address || "",
          city: data.user.city || "",
          country: data.user.country || "",
          occupation: data.user.occupation || "",
          status: data.user.status || "",
          role: data.user.role || "",
          createdAt: data.user.createdAt || "",
          updatedAt: data.user.updatedAt || "",
        });
      } else {
        setProfileForm({ ...FALLBACK_PROFILE, id: "no-user-payload" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileForm(FALLBACK_PROFILE);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  return { profileForm, profileLoading, updateField };
}