export const setUserType = (req, res, next) => {
  res.locals.user_UserType = req.session.user_UserType || null;
  next();
};