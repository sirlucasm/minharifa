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
      show: (shortName: string) => `/rifas/${shortName}`,
      requestInvite: (shortName: string) =>
        `/rifas/${shortName}/solicitar-convite`,
      acceptInvite: (shortName: string) =>
        `/rifas/${shortName}/aceitar-convite`,
      edit: (shortName: string) => `/rifas/${shortName}/editar`,
    },

    event: {
      list: "/eventos",
      create: "/eventos/criar",
      show: (shortName: string) => `/eventos/${shortName}`,
      requestInvite: (shortName: string) =>
        `/eventos/${shortName}/solicitar-convite`,
      acceptInvite: (shortName: string) =>
        `/eventos/${shortName}/aceitar-convite`,
      edit: (shortName: string) => `/eventos/${shortName}/editar`,
    },
    eventGuests: {
      list: (shortName: string, eventId: string) =>
        `/eventos/${shortName}/${eventId}/convidados`,
      create: (shortName: string, eventId: string) =>
        `/eventos/${shortName}/${eventId}/convidados/adicionar`,
      createGroup: (shortName: string, eventId: string) =>
        `/eventos/${shortName}/${eventId}/convidados/criar-grupo`,
      show: (shortName: string, eventId: string, eventGuestId: string) =>
        `/eventos/${shortName}/${eventId}/convidados/ver?eventgid=${eventGuestId}&type=guest`,
      shareQRCode: (shortName: string, eventId: string, eventGuestId: string) =>
        `/eventos/${shortName}/${eventId}/convidados/confirmar-presenca?eventgid=${eventGuestId}&type=guest`,
    },
    eventGuestGroups: {
      show: (shortName: string, eventId: string, eventGuestGroupId: string) =>
        `/eventos/${shortName}/${eventId}/convidados/ver?eventguestgroupid=${eventGuestGroupId}&type=group`,
      shareQRCode: (
        shortName: string,
        eventId: string,
        eventGuestGroupId: string
      ) =>
        `/eventos/${shortName}/${eventId}/convidados/confirmar-presenca?eventguestgroupid=${eventGuestGroupId}&type=group`,
    },
  },
};

interface RoutesProps {
  public: typeof routes.public;
  private: typeof routes.private;
}

export default routes;
export type { RoutesProps };
