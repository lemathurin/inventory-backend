const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateInviteCode = (): string => {
  let code = "";

  // Generate XXXX-XXXX pattern
  for (let i = 0; i < 8; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    if (i === 3) code += "-";
  }

  return code;
};

export const validateInviteCode = (code: string): boolean => {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
};
