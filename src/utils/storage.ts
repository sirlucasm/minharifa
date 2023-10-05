interface StorageKeys {
  last_logged_email: string;
  time_left: string;
}

export const setStorage = (key: string, value: any) => {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  localStorage.setItem(`minharifa@${key}`, value);
};

export const getStorage = (key: keyof StorageKeys) => {
  const value = localStorage.getItem(`minharifa@${key}`);
  if (value && value !== "undefined" && value !== "null") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  return null;
};

export const removeStorage = (key: keyof StorageKeys) =>
  localStorage.removeItem(`minharifa@${key}`);
