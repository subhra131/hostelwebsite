export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

export const validateForm = (name, email, password, role, phone) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (role === 'student' || role === 'owner') {
    if (!String(phone || '').trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Enter a valid phone number';
    }
  }

  return errors;
};
