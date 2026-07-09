import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const cookieToken = req.cookies?.token;
  const authorization = req.headers.authorization;
  let token = cookieToken;

  if (!token && authorization?.startsWith("Bearer ")) {
    token = authorization.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export default auth;
