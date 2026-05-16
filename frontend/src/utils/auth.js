const USER_STORAGE_KEY = "liquidAlchemyCurrentUser";
const LEGACY_USER_STORAGE_KEY = "liquidAlchemyUser";

export function getCurrentUser() {
  try {
    const userJson =
      localStorage.getItem(USER_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_USER_STORAGE_KEY);

    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  localStorage.removeItem("currentUser");
}

export function isAdminUser(user) {
  return user && (user.is_admin === true || user.role === "admin");
}

export function isUserLoggedIn() {
  return getCurrentUser() !== null;
}