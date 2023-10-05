const routes = {
  public: {
    login: "/",
    register: "/criar-conta",
    forgetPassword: "/esqueceu-senha",
    finishAccountCreation: "/criar-conta/finalizar",
  },
  private: {
    home: "/inicio",
  },
};

interface RoutesProps {
  public: typeof routes.public;
  private: typeof routes.private;
}

export default routes;
export type { RoutesProps };
