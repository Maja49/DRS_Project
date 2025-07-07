const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

export const updateUser = async (userData: Record<string, any>) => {
  try {
    const response = await fetch(`${BASE_URL}/users/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to update user data.");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in updateUser API:", error);
    throw error;
  }
};
