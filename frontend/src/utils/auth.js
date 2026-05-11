/**
 * User authentication utilities
 * Login/Signup logic is handled by groupmate
 * This module manages user session in localStorage and admin role checking
 */

const USER_STORAGE_KEY = "liquidAlchemyUser";

export function getCurrentUser() {
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem("liquidAlchemyCurrentUser");
  localStorage.removeItem("currentUser");
}

export function isAdminUser(user) {
  return user && user.is_admin === true;
}

export function isUserLoggedIn() {
  return getCurrentUser() !== null;
}
