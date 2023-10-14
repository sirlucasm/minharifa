const routes = {
  public: {
    login: "/",
    register: "/criar-conta",
    forgetPassword: "/esqueceu-senha",
    finishAccountCreation: "/criar-conta/finalizar",
  },
  private: {
    home: "/inicio",

    raffle: {
      list: "/rifas",
      create: "/rifas/criar",
      show: (slug: string) => `/rifas/${slug}`,
      requestInvite: (slug: string) => `/rifas/${slug}/solicitar-convite`,
      acceptInvite: (slug: string) => `/rifas/${slug}/aceitar-convite`,
      edit: (slug: string) => `/rifas/${slug}/editar`,
    },

    events: {
      list: "/eventos",
    },
  },
};

interface RoutesProps {
  public: typeof routes.public;
  private: typeof routes.private;
}

export default routes;
export type { RoutesProps };
