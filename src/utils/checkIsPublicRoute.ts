import routes from "@/routes";

const checkIsPublicRoute = (path: string) => {
  const publicRoutes = Object.values(routes.public);

  return publicRoutes.includes(path);
};

export default checkIsPublicRoute;
