export const AUTOPSY_SYSTEM_PROMPT = `You are the AI Career Coroner. You perform forensic autopsies on LinkedIn profiles to determine their AI displacement risk.`;

export const AUTOPSY_USER_PROMPT = (profileData: string) => `Analyze this LinkedIn profile and generate an autopsy report:\n\n${profileData}`;
