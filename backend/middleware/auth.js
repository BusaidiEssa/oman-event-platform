import jwt from 'jsonwebtoken';


export const authenticateToken = (req, res, next) => {
    // get the token from the cookies
  const token = req.cookies.token;
    // if no token is found deny access
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  //if a token is found verify it using the secret key
  try {
    //this checks token vailidity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // This allows access to the user ID in subsequent middleware/routes
    req.managerId = decoded.id;

    //token is valid proceed to the next middleware/route
    next();
  } catch (error) {
    //token is invalid
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};