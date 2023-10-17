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

    event: {
      list: "/eventos",
      create: "/eventos/criar",
      show: (slug: string) => `/eventos/${slug}`,
      requestInvite: (slug: string) => `/eventos/${slug}/solicitar-convite`,
      acceptInvite: (slug: string) => `/eventos/${slug}/aceitar-convite`,
      edit: (slug: string) => `/eventos/${slug}/editar`,
    },
  },
};

interface RoutesProps {
  public: typeof routes.public;
  private: typeof routes.private;
}

export default routes;
export type { RoutesProps };
