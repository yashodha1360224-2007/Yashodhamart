export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return "Email address is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address (e.g. name@example.com).";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) return "Phone number is required.";
  const phoneRegex = /^[6-9]\d{9}$/; // Standard Indian 10-digit mobile phone format
  if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
    return "Please enter a valid 10-digit mobile number starting with 6-9.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one digit.";
  return null;
}

export function validateName(name: string): string | null {
  if (!name || !name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters long.";
  return null;
}

export function validateAddress(data: {
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) errors.fullName = "Full name is required.";
  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;
  if (!data.houseBuilding?.trim()) errors.houseBuilding = "House/Building info is required.";
  if (!data.street?.trim()) errors.street = "Street address is required.";
  if (!data.area?.trim()) errors.area = "Area/Locality is required.";
  if (!data.city?.trim()) errors.city = "City is required.";
  if (!data.state?.trim()) errors.state = "State is required.";
  if (!/^\d{6}$/.test(data.pincode?.trim() || '')) errors.pincode = "Please enter a valid 6-digit PIN code.";

  return errors;
}
