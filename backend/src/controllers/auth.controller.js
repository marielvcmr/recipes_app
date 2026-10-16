import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(req, res) {
  const { user, token } = await registerUser(req.body);
  res.status(201).json({ data: { user, token } });
}

export async function login(req, res) {
  const { user, token } = await loginUser(req.body);
  res.json({ data: { user, token } });
}


/*
{
  data: {
    user: user,
    token: token
  }
}

{
  "data": {
    "user": {
      "username": "ana",
      "email": "ana@mail.com",
      "avatarColor": "#FF8800",
      "createdAt": "2026-10-16T14:00:00.000Z",
      "updatedAt": "2026-10-16T14:00:00.000Z",
      "id": "670f1a2b3c4d5e6f7a8b9c0d"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

 */