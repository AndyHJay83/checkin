// This file will be populated at runtime with the token
const token = process.env.CHECKIN_TOKEN;

export function getToken() {
    return token;
} 