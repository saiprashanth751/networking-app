// Firebase Admin SDK Service
import admin from 'firebase-admin';

// Extract credentials from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || 'network-app-notification-e8877';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@network-app-notification-e8877.iam.gserviceaccount.com';
const privateKey = process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDT2T+C6oYGQn1H
owiFE71zq6MpuehTN5foPVxTLGl+Ao5M/mu+FrLUAMO4Sz1WZJ4Pe1eJcr8A0n++
iwka5fZ9zeDO86BGikfGlF5XzniqejI43oyAD3ioAKO9zovYBmFNhhnGFUa/aO6R
Q8dFWxa0HRYcfCwTJgj6ekphtIyVFDiqmsZ/6bPVGcTUSieedlCKVCZaR7Wgwa55
CL7VJBw/9bqUD0f08IA+IEH2to838y7+Monvd/XTFd2XKMYawvRp0F9VIXkTHODI
zIW8VVv6e1bdjPIA2YiNwVdqkF2P0pDgjb/9vdoteFoHjjHmViQEYz68PGHfW1cS
zHuDCU+TAgMBAAECggEAV1N7SbTw8E2iJNCAp5KeirratE2NBhiphrMchrCM/8N/
8x8BPMdQifGSvDpPm3g4a3tVdzQUpfsfa2UWqL7Yn70pCUYF8G357lKknR9gQC3E
3Apo8jTucJpq5Mfqf28J1xILN8r3cdmIVdsRnnZQ4ogG4FETPgV0uAOG+8WYGa8P
OKIrd1Q8foRq3ezqcVirynWZlQG148eZm6dpmI7+pYoxW4LsKhTe8/BMcV0gsAb6
z+/EDUrJJIX0amowS03N9yQSXZmMgxJEyRpUSkPzdebCK8gSiNqFzSjHEsALpctF
/bPm/fpbD1Qggc47j3awee0Tv5ndCxcNEh3NRfSr2QKBgQDq0C8e4uSmL/nLDsWA
cAI8aO+AyRX0bwV6StlzXX1Ci6XdrkeIKYsyVFF8tjx1tjQhQgL/B/vRKLwYWlQf
uZHeRREbsy+PplXJeKl+9V/7sYD+s9pjFL1WjGoPTYVEhjLCItOPYKsQ4qoD1fGF
TBXTcjsLTjyCHImMU9R+0Jd/HwKBgQDm9p44CSCS674VLGwnTpE3eboLyAfLgl0Y
yq8siYv25T+o1oo0SR3Jebrnnaa0JdIXx9rc/JcKxgLFF4ul3P9hlY+mn9BKBQPk
TvrJZ1AQ7FOtDiD9unkhwayadO8joi6/tkobrBlwMLnGXUpU+Ch9+aHP8SKUT9Mg
aM17idvFDQKBgQCmQRS756ZAzIMudJz+HVBX+WxqYPX8hYb5WXmxJyaDMWEVHkpj
bBa0YeL4TAduyL0MNzLr43k2VIMpMvuRItDW8Uv1st8f9IOVDKvlylJVYQ6WSD1+
HbcZSn3lq9uJ8wKJViM4xxcX84SxBo/k80QY3C5WCOTqss3o34n66DH7vQKBgQCw
pwRQ+7osZZ8XdsiqL8+mTLZd+HrtzyIBqlTdjb698o4ER0OhxiLATRkFunEc7KiK
g9QEnjWwic7ojJ/FFwlFzCz5VtbrJnbZkwcCMMDukLNXc60MJCouBYJNCQ83g/6Z
p4V7MOCsDLiq3gPShZQC9oIrF9ZI9d0XttEjokezqQKBgQCzeTqvhpE61jjTnZjc
4tX49uHsk4GHgBPEQ/LnE0NxeqYTSshASK3GUvyHQiWW/hIPXePNRdaYXgQRpseQ
eEPzRWNEU/Kubhfspu5eeZlhvK1bHwocumhZOIm9Dx2iQ015kkBCYgDN0ccJqoKh
Tpnkl6fEl3nbjNwcc95U9Jjoeg==
-----END PRIVATE KEY-----`;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
            }),
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
    }
}

const messaging = admin.messaging();

export { messaging, admin };
